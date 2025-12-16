import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:7000/api";

export function CreateRequest() {
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(""); // default placeholder
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });
  const [groupUsers, setGroupUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Fetch statuses
  const fetchStatuses = async () => {
    if (!token) {
      setAlert({ show: true, type: "danger", message: "You are not logged in!" });
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatuses(res.data);
    } catch (err) {
      console.error("Error fetching statuses:", err);
      setAlert({ show: true, type: "danger", message: "Failed to load status list" });
    } finally {
      setLoadingStatuses(false);
    }
  };

  // Fetch all users for the table (read-only)
  const fetchGroupUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/group`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroupUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setAlert({ show: true, type: "danger", message: "Failed to load group users" });
    }
  };

  useEffect(() => {
    fetchStatuses();
    fetchGroupUsers();
  }, []);

  // Apply request for the logged-in agent
  const applyRequest = async (status) => {
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/requests`,
        { userId, statusName: status, reason: status === "Emergency Briefing" ? reason : "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({
        show: true,
        type: "success",
        message:
          status === "Emergency Briefing"
            ? "Emergency Briefing request sent successfully!"
            : `Request "${status}" applied successfully!`,
      });

      setReason(""); // reset reason
      setSelectedStatus("");
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
    }
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);

    if (status !== "Emergency Briefing") {
      applyRequest(status);
    } else {
      setAlert({ show: false, type: "success", message: "" }); // reset alert
    }
  };

  if (loadingStatuses) return <p>Loading statuses...</p>;

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

      {/* Status selection for agent */}
      <div className="mb-3">
        <label className="form-label">Select Status</label>
        <select
          className="form-select"
          value={selectedStatus}
          onChange={handleStatusChange}
          disabled={loading}
        >
          <option value="" disabled>
            Select Status
          </option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Emergency Briefing reason */}
      {selectedStatus === "Emergency Briefing" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyRequest(selectedStatus);
          }}
        >
          <div className="mb-3">
            <label className="form-label">Reason</label>
            <textarea
              className="form-control"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
              required
            />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit Emergency Briefing"}
          </button>
        </form>
      )}

      {/* Search users */}
      <div className="mb-3 mt-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search users by full name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users table */}
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
            <tr
              key={user.userId}
              className={user.userId === userId ? "table-primary" : ""}
            >
              <td>{user.userId}</td>
              <td>{user.firstName} {user.middleName}</td>
              <td>{user.coachGroup}</td>
              <td>{user.role}</td>
              <td>{user.statusName || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
