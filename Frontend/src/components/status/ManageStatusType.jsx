import { useState, useEffect } from "react";

const API_URI = "http://localhost:7000/api";

export function ManageStatusType() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [newStatus, setNewStatus] = useState({ statusName: "", description: "" });
  const [editStatus, setEditStatus] = useState(null);
  const [deleteStatusName, setDeleteStatusName] = useState(null);

  // Toast utility
  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // Fetch statuses
  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URI}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setStatuses(data.statuses || []);
      else addToast(data.message || "Failed to fetch statuses", "danger");
    } catch (err) {
      addToast("Server error fetching statuses", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // Input changes
  const handleChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) setEditStatus((prev) => ({ ...prev, [name]: value }));
    else setNewStatus((prev) => ({ ...prev, [name]: value }));
  };

  // Create status
  const handleCreateStatus = async (e) => {
    e.preventDefault();
    const { statusName, description } = newStatus;

    if (!statusName) return addToast("Status Name is required", "danger");

    if (statuses.some((s) => s.statusName.toLowerCase() === statusName.toLowerCase())) {
      return addToast("Status name already exists", "warning");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URI}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statusName, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      addToast("Status created successfully", "success");

      setStatuses((prev) => [
        ...prev,
        { statusName, description, userId: data.status.userId },
      ]);

      setNewStatus({ statusName: "", description: "" });
    } catch (err) {
      addToast(err.message || "Server error", "danger");
    }
  };

  // Delete status
  const handleDeleteStatus = async () => {
    if (!deleteStatusName) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URI}/status/${deleteStatusName}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      addToast("Status deleted successfully", "success");

      setStatuses((prev) => prev.filter((s) => s.statusName !== deleteStatusName));
    } catch (err) {
      addToast(err.message || "Server error", "danger");
    } finally {
      setDeleteStatusName(null);
    }
  };

  // Update status
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editStatus?.statusName) return addToast("Status name is required", "danger");

    try {
      const token = localStorage.getItem("token");
      const oldName = editStatus.originalStatusName;

      const res = await fetch(`${API_URI}/status/${oldName}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          statusName: editStatus.statusName,
          description: editStatus.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      addToast("Status updated successfully", "success");

      setStatuses((prev) =>
        prev.map((s) =>
          s.statusName === oldName
            ? {
                ...s,
                statusName: editStatus.statusName,
                description: editStatus.description,
              }
            : s
        )
      );

      setEditStatus(null);
    } catch (err) {
      addToast(err.message || "Server error", "danger");
    }
  };

  return (
    <div className="container mt-3">
      <h5 className="mb-3 fw-bold text-center">Mange status types</h5>

      {/* CREATE FORM */}
      <form className="card p-3 mb-4 shadow-sm" onSubmit={handleCreateStatus}>
        <div className="row g-2 align-items-end">
          <div className="col-md-6">
            <input
              type="text"
              name="statusName"
              className="form-control"
              placeholder="Status Name"
              value={newStatus.statusName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <input
              type="text"
              name="description"
              className="form-control"
              placeholder="Description"
              value={newStatus.description}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">
              Create
            </button>
          </div>
        </div>
      </form>

      {/* TABLE */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border"></div>
        </div>
      ) : statuses.length === 0 ? (
        <p>No statuses found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-white">
              <tr>
                <th>User ID</th>
                <th>Status Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {statuses.map((status) => (
                <tr key={status.statusName}>
                  <td>{status.userId}</td>
                  <td>{status.statusName}</td>
                  <td>{status.description}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-white me-2"
                      onClick={() =>
                        setEditStatus({
                          ...status,
                          originalStatusName: status.statusName,
                        })
                      }
                    >
                       <i className="bi bi-pencil text-primary"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-white"
                      onClick={() => setDeleteStatusName(status.statusName)}
                    >
                      <i className="bi bi-trash text-danger"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {editStatus && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <form className="modal-content p-3" onSubmit={handleUpdateStatus}>
              <input
                type="text"
                name="statusName"
                className="form-control mb-2"
                placeholder="Status Name"
                value={editStatus.statusName}
                onChange={(e) => handleChange(e, true)}
                required
              />
              <input
                type="text"
                name="description"
                className="form-control mb-2"
                placeholder="Description"
                value={editStatus.description}
                onChange={(e) => handleChange(e, true)}
              />
              <div className="text-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => setEditStatus(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteStatusName && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteStatusName(null)}
                ></button>
              </div>

              <div className="modal-body">
                <p>Are you sure you want to delete this status?</p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteStatusName(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDeleteStatus}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div
        className="position-fixed bottom-0 end-0 p-3"
        style={{ zIndex: 2000, maxWidth: "350px" }}
      >
        {toasts.map((t) => (
          <div key={t.id} className={`toast show text-white bg-${t.type} mb-2`}>
            <div className="d-flex">
              <div className="toast-body">{t.message}</div>
              <button
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() =>
                  setToasts((prev) => prev.filter((x) => x.id !== t.id))
                }
              ></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
