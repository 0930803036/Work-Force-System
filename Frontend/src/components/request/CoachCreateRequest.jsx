import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = "http://localhost:7000/api";
const SOCKET_URL = "http://localhost:7000";

export function CoachCreateRequest() {
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const coachId = localStorage.getItem("userId");
  const coachGroup = localStorage.getItem("coachGroup");

  // Socket for emergency briefing
  useEffect(() => {
    const socket = io(SOCKET_URL, { auth: { token } });

    socket.on("connect", () => console.log("Connected to socket server"));

    socket.on("new-emergency-briefing", (request) => {
      setPendingRequests((prev) => [...prev, request]);
      setShowModal(true);
    });

    return () => socket.disconnect();
  }, [token]);

  // Fetch available statuses
  const fetchStatuses = async () => {
    try {
      const res = await axios.get(`${API_URL}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatuses(res.data);
    } catch (err) {
      setAlert({ show: true, type: "danger", message: "Failed to load status list" });
    } finally {
      setLoadingStatuses(false);
    }
  };

  // Fetch users in coach group
  const fetchGroupUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/group`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroupUsers(res.data);
    } catch (err) {
      console.error("Error fetching group users:", err);
      setAlert({ show: true, type: "danger", message: "Failed to load group users" });
    }
  };

  useEffect(() => {
    fetchStatuses();
    fetchGroupUsers();
  }, []);

  // Apply status to all users (top dropdown)
  const applyRequest = async (status) => {
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/requests`,
        { coachId, coachGroup, statusName: status, reason: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({
        show: true,
        type: "success",
        message: `Status "${status}" applied to your group successfully!`,
      });

      fetchGroupUsers();
    } catch (err) {
      console.error("Error creating request:", err);
      setAlert({
        show: true,
        type: "danger",
        message: err.response?.data?.error || "Failed to create request",
      });
    } finally {
      setLoading(false);
      setSelectedStatus("");
    }
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    applyRequest(status);
  };

  // Apply status to individual user (inline) with optimistic UI
  const applyUserStatus = async (userId, statusName) => {
    // Optimistic update
    const prevStatus = groupUsers.find((u) => u.userId === userId)?.statusName;
    setGroupUsers((prevUsers) =>
      prevUsers.map((u) => (u.userId === userId ? { ...u, statusName } : u))
    );

    try {
      await axios.post(
        `${API_URL}/requests`,
        { coachId, coachGroup, userId, statusName, reason: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({
        show: true,
        type: "success",
        message: `Status "${statusName}" applied to user ${userId}!`,
      });
    } catch (err) {
      // Revert if failed
      setGroupUsers((prevUsers) =>
        prevUsers.map((u) => (u.userId === userId ? { ...u, statusName: prevStatus || "-" } : u))
      );
      console.error("Error updating user status:", err);
      setAlert({
        show: true,
        type: "danger",
        message: err.response?.data?.error || "Failed to update user status",
      });
    }
  };

  const handleApproveReject = async (requestId, action) => {
    try {
      await axios.post(
        `${API_URL}/requests/${requestId}/approve-emergency`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({ show: true, type: "success", message: `Request ${action}d successfully!` });
      setPendingRequests(pendingRequests.filter((r) => r.id !== requestId));

      if (pendingRequests.length === 1) setShowModal(false);

      fetchGroupUsers();
    } catch (err) {
      setAlert({
        show: true,
        type: "danger",
        message: err.response?.data?.error || "Failed",
      });
    }
  };

  if (loadingStatuses) return <p>Loading statuses...</p>;

  // Filtered users based on search term
  const filteredUsers = groupUsers.filter((user) =>
    `${user.firstName} ${user.middleName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h3>Create Request</h3>

      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlert({ ...alert, show: false })}
          ></button>
        </div>
      )}

      {/* Apply to All Dropdown */}
      <div className="mb-3">
        <label className="form-label">Select Status for All</label>
        <select
          className="form-select"
          value={selectedStatus}
          onChange={handleStatusChange}
          disabled={loading}
        >
          <option value="" disabled>Select Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <h5 className="mt-4">Agents in your Coach Group</h5>

      {/* Live Search Input */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by full name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="table table-bordered mt-2">
        <thead>
          <tr>
            <th>User Id</th>
            <th>Full Name</th>
            <th>Coach Group</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.userId}>
              <td>{user.userId}</td>
              <td>{user.firstName} {user.middleName}</td>
              <td>{user.coachGroup}</td>
              <td>{user.role}</td>
              <td>
                <select
                  className="form-select"
                  value={user.statusName || ""}
                  onChange={(e) => applyUserStatus(user.userId, e.target.value)}
                >
                  <option value="" disabled>Select Status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Emergency Briefing Modal */}
      {showModal && pendingRequests.length > 0 && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Pending Emergency Briefings</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="mb-3 border p-2">
                    <p><strong>{req.userName}</strong> requested Emergency Briefing.</p>
                    <button
                      className="btn btn-success me-2"
                      onClick={() => handleApproveReject(req.id, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleApproveReject(req.id, "reject")}
                    >
                      Reject
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
