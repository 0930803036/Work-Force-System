import { useState, useEffect } from "react";

const API_URI = "http://localhost:7000/api";

export function ManageShiftSchedule() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [deleteShiftName, setDeleteShiftName] = useState(null);
  const [editShift, setEditShift] = useState(null);

  const [newShift, setNewShift] = useState({
    shiftName: "",
    shiftStart: "",
    shiftEnd: "",
  });

  // ---------------------------
  // Toast Utility
  // ---------------------------
  const addToast = (message, variant = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  // ---------------------------
  // Fetch Shifts
  // ---------------------------
  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URI}/shifts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // Sort shifts by shiftStart
        const sorted = (data.shifts || []).slice().sort((a, b) => a.shiftStart.localeCompare(b.shiftStart));
        setShifts(sorted);
      } else addToast(data.message || "Failed to fetch shifts", "danger");
    } catch (err) {
      addToast("Server error fetching shifts", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // ---------------------------
  // Handle form changes
  // ---------------------------
  const handleChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) setEditShift((prev) => ({ ...prev, [name]: value }));
    else setNewShift((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------------------
  // Create Shift
  // ---------------------------
  const handleCreateShift = async (e) => {
    e.preventDefault();
    const { shiftName, shiftStart, shiftEnd } = newShift;

    if (!shiftName || !shiftStart || !shiftEnd) {
      addToast("All fields are required", "danger");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URI}/shifts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newShift),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      addToast("Shift created successfully", "success");
      setShifts((prev) =>
        [...prev, data.shift].sort((a, b) => a.shiftStart.localeCompare(b.shiftStart))
      );
      setNewShift({ shiftName: "", shiftStart: "", shiftEnd: "" });
    } catch (err) {
      addToast(err.message || "Server error", "danger");
    }
  };

  // ---------------------------
  // Delete Shift
  // ---------------------------
  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URI}/shifts/${deleteShiftName}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      addToast(`Shift "${deleteShiftName}" deleted successfully`, "success");
      setShifts((prev) => prev.filter((s) => s.shiftName !== deleteShiftName));
      setDeleteShiftName(null);
    } catch (err) {
      addToast(err.message || "Server error", "danger");
    }
  };

  // ---------------------------
  // Update Shift
  // ---------------------------
  const handleUpdateShift = async () => {
    const { newShiftName, shiftName, shiftStart, shiftEnd } = editShift;

    if (!shiftName || !shiftStart || !shiftEnd) {
      addToast("All fields are required", "danger");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URI}/shifts/${shiftName}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          newShiftName: newShiftName || undefined,
          shiftStart,
          shiftEnd
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      addToast("Shift updated successfully", "success");
      setShifts((prev) =>
        prev
          .map((s) => (s.shiftName === shiftName ? data.shift : s))
          .sort((a, b) => a.shiftStart.localeCompare(b.shiftStart))
      );
      setEditShift(null);
    } catch (err) {
      addToast(err.message || "Server error", "danger");
    }
  };

  return (
    <div className="container mt-3">
      <h5 className="mb-3 fw-bold text-center">Manage Shift Schedules</h5>

      {/* CREATE SHIFT FORM */}
      <form className="card p-3 mb-4 shadow-sm" onSubmit={handleCreateShift}>
        <div className="row g-3">
          <div className="col-md-4">
            <input
              type="text"
              name="shiftName"
              className="form-control"
              placeholder="Shift Name"
              value={newShift.shiftName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="time"
              name="shiftStart"
              className="form-control"
              value={newShift.shiftStart}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="time"
              name="shiftEnd"
              className="form-control"
              value={newShift.shiftEnd}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100">Create Shift</button>
          </div>
        </div>
      </form>

      {/* SHIFTS TABLE */}
      {loading ? (
        <p>Loading shifts...</p>
      ) : shifts.length === 0 ? (
        <p>No shifts found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-secondary">
              <tr>
                <th>User ID</th>
                <th>Shift Name</th>
                <th>Shift start</th>
                <th>Shift end</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift, index) => (
                <tr key={index}>
                  <td>{shift.userId}</td>
                  <td>{shift.shiftName}</td>
                  <td>{shift.shiftStart}</td>
                  <td>{shift.shiftEnd}</td>
                  <td>
                    <button
                      className="btn btn-white btn-sm me-2"
                      onClick={() => setEditShift(shift)}
                    >
                      <i className="bi bi-pencil text-primary"></i>
                    </button>
                    <button
                      className="btn btn-white btn-sm"
                      onClick={() => setDeleteShiftName(shift.shiftName)}
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
      {editShift && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Edit Shift "{editShift.shiftName}"</h5>
              <input
                type="text"
                name="newShiftName"
                className="form-control mb-2"
                value={editShift.newShiftName || ""}
                onChange={(e) =>
                  setEditShift((prev) => ({ ...prev, newShiftName: e.target.value }))
                }
                placeholder="New shift name"
              />
              <input
                type="time"
                name="shiftStart"
                className="form-control mb-2"
                value={editShift.shiftStart}
                onChange={(e) => handleChange(e, true)}
              />
              <input
                type="time"
                name="shiftEnd"
                className="form-control mb-2"
                value={editShift.shiftEnd}
                onChange={(e) => handleChange(e, true)}
              />
              <div className="mt-2 text-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setEditShift(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleUpdateShift}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteShiftName && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5 className="text-danger">Confirm Delete</h5>
              <p>Are you sure you want to delete shift "{deleteShiftName}"?</p>
              <div className="text-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setDeleteShiftName(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleConfirmDelete}>
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
          <div key={t.id} className={`toast show text-white bg-${t.variant} mb-2`}>
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
