import { useState, useEffect } from "react";

const API_URL = "http://localhost:7000/api";

export function ReadUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [userToDelete, setUserToDelete] = useState(null); // NEW DELETE MODAL STATE

  const usersPerPage = 50;
  const token = localStorage.getItem("token");

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Edit handlers
  const startEdit = (userId, user) => {
    setEditingUserId(userId);
    setEditForm({ ...user, password: "" });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditForm({});
  };

  const handleChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  // SAVE EDIT — With HTML error protection
  const saveEdit = async () => {
    try {
      const filteredEditForm = Object.fromEntries(
        Object.entries(editForm).filter(([_, value]) => value !== "")
      );

      const res = await fetch(`${API_URL}/users/${editingUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(filteredEditForm),
      });

      // PROTECT AGAINST HTML ERRORS
      const resText = await res.text();
      let parsed;

      try {
        parsed = JSON.parse(resText);
      } catch {
        console.error("SERVER HTML ERROR:", resText);
        throw new Error("Server returned an invalid response (HTML instead of JSON)");
      }

      if (!res.ok) throw new Error(parsed.message || "Failed to update user");

      await fetchUsers();
      cancelEdit();
    } catch (err) {
      alert("Update error: " + err.message);
    }
  };

  // LOGIC: deleteUser now opens modal
  const openDeleteModal = (userId) => {
    setUserToDelete(userId);
  };

  // Actually delete after modal confirm
  const confirmDeleteUser = async () => {
    try {
      const res = await fetch(`${API_URL}/users/${userToDelete}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.userId !== userToDelete));
      setUserToDelete(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // Toggle staff/account status
  const toggleStaffStatus = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/users/staff/${userId}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to toggle staff status");
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  /** toggle user whitelist */
  const togglUserWhitelist = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/users/whitelist/${userId}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to toggle whitelist status");
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleAccountStatus = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/users/account/${userId}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to toggle account status");
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  // Auto-search filter
  const filteredUsers = users.filter((u) =>
    u.userId.toString().includes(searchInput.trim())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  if (loading) return <h2>Loading...</h2>;
  if (error) return <p className="text-danger">Error: {error}</p>;

  const editingUser = editingUserId
    ? users.find((u) => u.userId === editingUserId)
    : null;

  return (
    <div className="container bg-light rounded mt-2 p-3">
      <h5 className="py-1">Users List Table</h5>

      {/* Search */}
      <div className="mb-2">
        <div className="input-group" style={{ maxWidth: "400px" }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search users by user Id..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive" style={{ maxHeight: "500px" }}>
        <table className="table table-hover w-100">
          <thead className="text-nowrap">
            <tr>
              <th>User Id</th>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Delegated Role</th>
              <th>Skill</th>
              <th>Channel</th>
              <th>Coach Group</th>
              <th>Supervisor Group</th>
              <th>Manager Group</th>
              <th>Site</th>
              <th>Director</th>
              <th>White-list</th>
              <th>Active</th>
              <th>Lock</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody className="text-nowrap">
            {paginatedUsers.map((user) => (
              <tr key={user.userId}>
                <td>{user.userId}</td>
                <td>{user.firstName}</td>
                <td>{user.middleName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.role}</td>
                <td>{user.delegatedRole}</td>
                <td>{user.skill}</td>
                <td>{user.channel}</td>
                <td>{user.coachGroup}</td>
                <td>{user.supervisorGroup}</td>
                <td>{user.managerGroup}</td>
                <td>{user.site}</td>
                <td>{user.director}</td>

                {/* Whitelist */}
                <td className="text-center">
                  <div className="form-check form-switch m-0 d-inline-block">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={user.whiteList}
                      onChange={() => togglUserWhitelist(user.userId)}
                    />
                  </div>
                </td>

                {/* Active/Deactive */}
                <td className="text-center">
                  <div className="form-check form-switch m-0 d-inline-block">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={user.staffStatus}
                      onChange={() => toggleStaffStatus(user.userId)}
                    />
                  </div>
                </td>

                {/* Lock/Unlock */}
                <td className="text-center">
                  <div className="form-check form-switch m-0 d-inline-block">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={user.accountStatus}
                      onChange={() => toggleAccountStatus(user.userId)}
                    />
                  </div>
                </td>

                {/* ACTION BUTTONS */}
                <td className="text-center">
                  <button
                    className="btn btn-sm"
                    onClick={() => startEdit(user.userId, user)}
                    title="Edit"
                  >
                    <i className="bi bi-pencil text-primary"></i>
                  </button>

                  <button
                    className="btn btn-sm"
                    onClick={() => openDeleteModal(user.userId)}
                    title="Delete"
                  >
                    <i className="bi bi-trash text-danger"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
        <button
          className="btn btn-outline-primary btn-sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="btn btn-outline-primary btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>

      {/* EDIT MODAL */}
      {editingUser && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Edit User: {editingUser.userId}
                </h5>
                <button className="btn-close" onClick={cancelEdit}></button>
              </div>

              <div className="modal-body">
                <div className="row g-2">
                  {[
                    "firstName",
                    "middleName",
                    "lastName",
                    "userName",
                    "password",
                    "email",
                    "phone",
                    "role",
                    "delegatedRole",
                    "skill",
                    "channel",
                    "coachGroup",
                    "supervisorGroup",
                    "managerGroup",
                    "site",
                    "director",
                  ].map((field) => (
                    <div className="col-md-4 mb-3" key={field}>
                      <div className="form-floating">
                        <input
                          type={field === "password" ? "password" : "text"}
                          className="form-control"
                          name={field}
                          value={editForm[field] || ""}
                          onChange={handleChange}
                          placeholder={field}
                        />
                        <label>{field}</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-success" onClick={saveEdit}>
                  Save
                </button>
                <button className="btn btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  className="btn-close"
                  onClick={() => setUserToDelete(null)}
                ></button>
              </div>

              <div className="modal-body">
                Are you sure you want to delete user{" "}
                <strong>{userToDelete}</strong>?
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setUserToDelete(null)}
                >
                  Cancel
                </button>

                <button className="btn btn-danger" onClick={confirmDeleteUser}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
