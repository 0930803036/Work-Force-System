import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const API_BASE = "http://localhost:7000";
const SOCKET_URL = API_BASE;

export function ViewAllStatus() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -------------------------------
  // Fetch all requests from backend
  // -------------------------------
  const fetchRequests = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/requests/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch requests");
        setRequests([]);
        return;
      }

      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Approve / Cancel / Delete
  // -------------------------------
  const approveRequest = async (userId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Approve this request?")) return;

    try {
      const res = await fetch(`${API_BASE}/requests/approve/${userId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      await res.json();
      fetchRequests();
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const cancelRequest = async (userId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Cancel this request?")) return;

    try {
      const res = await fetch(`${API_BASE}/requests/cancel/${userId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      await res.json();
      fetchRequests();
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  const deleteRequest = async (userId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Delete this request?")) return;

    try {
      const res = await fetch(`${API_BASE}/requests/delete/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await res.json();
      fetchRequests();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // -------------------------------
  // Socket.IO Realtime Sync
  // -------------------------------
  useEffect(() => {
    fetchRequests();

    const socket = io(SOCKET_URL);

    const events = [
      "userLoggedIn",      // ✅ Now handles login updates
      "requestCreated",
      "requestApproved",
      "requestCanceled",
      "requestDeleted",
      "statusAutoSet",
      "userLoggedOut",
      "userStatusChanged",
    ];

    const refresh = () => setTimeout(fetchRequests, 200); // buffer delay to allow DB writes
    events.forEach((e) => socket.on(e, refresh));

    return () => {
      events.forEach((e) => socket.off(e, refresh));
      socket.disconnect();
    };
  }, []);

  // -------------------------------
  // Keep only the latest request per user
  // -------------------------------
  const latestRequests = Object.values(
    requests.reduce((acc, curr) => {
      const existing = acc[curr.userId];
      if (!existing || new Date(curr.requestedAt) > new Date(existing.requestedAt)) {
        acc[curr.userId] = curr;
      }
      return acc;
    }, {})
  );

  // -------------------------------
  // Filter: Logged-In & Active users
  // -------------------------------
  const onlineUsers = latestRequests.filter(
    (r) => r.loginLogout === "Login" && r.status !== "Offline"
  );

  // -------------------------------
  // Render Table
  // -------------------------------
  return (
    <div className="container my-4">
      <h4>🟢 Online / Logged-In Users Today</h4>

      <button
        onClick={fetchRequests}
        disabled={loading}
        className="btn btn-primary mb-3"
      >
        {loading ? "Loading..." : "Refresh"}
      </button>

      {error && <p className="text-danger">{error}</p>}

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>User ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Coach Group</th>
            <th>Login/Logout</th>
            <th>Request Type</th>
            <th>Status</th>
            <th style={{ minWidth: "150px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {onlineUsers.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center text-muted">
                No logged-in users today
              </td>
            </tr>
          ) : (
            onlineUsers.map((req) => (
              <tr key={`${req.userId}-${req.requestedAt}`}>
                <td>{req.userId}</td>
                <td>{req.UserManagment?.firstName}</td>
                <td>{req.UserManagment?.lastName}</td>
                <td>{req.UserManagment?.coachGroup}</td>
                <td>{req.loginLogout}</td>
                <td>{req.requestType}</td>
                <td>
                  <span
                    className={
                      req.status === "Approved"
                        ? "text-primary fw-bold"
                        : req.status === "Pending"
                        ? "text-warning fw-bold"
                        : req.status === "Available"
                        ? "text-success fw-bold"
                        : "text-secondary fw-bold"
                    }
                  >
                    {req.status}
                  </span>
                </td>
                <td>
                  <div className="d-flex" style={{ gap: "0.5rem" }}>
                    <button
                      className="btn btn-sm"
                      onClick={() => approveRequest(req.userId)}
                      disabled={loading}
                      title="Approve request"
                    >
                      <i className="bi bi-check-circle text-success"></i>
                    </button>

                    <button
                      className="btn btn-sm"
                      onClick={() => cancelRequest(req.userId)}
                      disabled={loading}
                      title="Cancel request"
                    >
                      <i className="bi bi-x-circle text-secondary"></i>
                    </button>

                    <button
                      className="btn btn-sm"
                      onClick={() => deleteRequest(req.userId)}
                      disabled={loading}
                      title="Delete request"
                    >
                      <i className="bi bi-trash text-danger"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
