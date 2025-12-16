import { useState, useEffect } from "react";

const API_URI = "http://localhost:7000/api";

export function ViewConfigurations() {
  const [configs, setConfigs] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const [currentConfig, setCurrentConfig] = useState(null);
  const [configToDelete, setConfigToDelete] = useState(null);

  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  };

  const formatTime = (time) => (time ? time : "-");

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const [configsRes, shiftsRes, statusesRes] = await Promise.all([
        fetch(`${API_URI}/configurations`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${API_URI}/shifts`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${API_URI}/status`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);

      setConfigs(Array.isArray(configsRes) ? configsRes : configsRes.configurations || []);
      setShifts(Array.isArray(shiftsRes) ? shiftsRes : shiftsRes.shifts || []);
      setStatuses(Array.isArray(statusesRes) ? statusesRes : statusesRes.statuses || []);
    } catch (err) {
      addToast("Failed to fetch data", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = (config) => setCurrentConfig({ ...config });

  const handleSaveUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URI}/configurations/${currentConfig.userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentConfig),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      addToast("Configuration updated successfully", "success");
      setConfigs((prev) =>
        prev.map((c) => (c.userId === currentConfig.userId ? currentConfig : c))
      );
      setCurrentConfig(null);
    } catch (err) {
      addToast(err.message, "danger");
    }
  };

  const handleDeleteClick = (config) => setConfigToDelete(config);

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URI}/configurations/${configToDelete.userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      addToast("Configuration deleted", "success");
      setConfigs((prev) => prev.filter((c) => c.userId !== configToDelete.userId));
      setConfigToDelete(null);
    } catch (err) {
      addToast(err.message, "danger");
    }
  };

  return (
    <div className="container mt-3">
      <h5 className="fw-bold mb-2 text-center"> Rest and Briefing Configurations</h5>

      {loading ? (
        <div className="text-center my-2">
          <div className="spinner-border"></div>
        </div>
      ) : configs.length === 0 ? (
        <p>No configurations found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table" style={{ whiteSpace: "nowrap" }}>
            <thead className="table-white">
              <tr>
                <th>Channel</th>
                <th>Skill</th>
                <th>Manager</th>
                <th>Supervisor</th>
                <th>Coach</th>
                <th>Availability</th>
                <th>Shift</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((c, i) => (
                <tr key={i}>
                  <td>{c.channel}</td>
                  <td>{c.skill}</td>
                  <td>{c.managerGroup || "-"}</td>
                  <td>{c.supervisorGroup || "-"}</td>
                  <td>{c.coachGroup || "-"}</td>
                  <td>{c.teamAvailability?.toFixed(2)}</td>
                  <td>{c.shiftName || "-"}</td>
                  <td>{formatTime(c.startTime)}</td>
                  <td>{formatTime(c.endTime)}</td>
                  <td>{c.statusName || "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      data-bs-toggle="modal"
                      data-bs-target="#updateModal"
                      onClick={() => handleUpdate(c)}
                    >
                      Update
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      data-bs-toggle="modal"
                      data-bs-target="#deleteModal"
                      onClick={() => handleDeleteClick(c)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Modal */}
      <div className="modal fade" id="updateModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update Configuration</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              {currentConfig && (
                <div className="container">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label">Channel</label>
                      <input
                        className="form-control"
                        value={currentConfig.channel}
                        onChange={(e) =>
                          setCurrentConfig({ ...currentConfig, channel: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Skill</label>
                      <input
                        className="form-control"
                        value={currentConfig.skill}
                        onChange={(e) =>
                          setCurrentConfig({ ...currentConfig, skill: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Manager Group</label>
                      <input
                        className="form-control"
                        value={currentConfig.managerGroup || ""}
                        onChange={(e) =>
                          setCurrentConfig({ ...currentConfig, managerGroup: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Supervisor Group</label>
                      <input
                        className="form-control"
                        value={currentConfig.supervisorGroup || ""}
                        onChange={(e) =>
                          setCurrentConfig({ ...currentConfig, supervisorGroup: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Coach Group</label>
                      <input
                        className="form-control"
                        value={currentConfig.coachGroup || ""}
                        onChange={(e) =>
                          setCurrentConfig({ ...currentConfig, coachGroup: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Team Availability</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={currentConfig.teamAvailability || ""}
                        onChange={(e) =>
                          setCurrentConfig({
                            ...currentConfig,
                            teamAvailability: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>

                    {/* Shift Name */}
                    <div className="col-md-3">
                      <label className="form-label">Shift Name</label>
                      <select
                        className="form-select"
                        value={currentConfig.shiftName || ""}
                        onChange={(e) =>
                          setCurrentConfig({ ...currentConfig, shiftName: e.target.value })
                        }
                      >
                        <option value="">Select shift</option>
                        {shifts.map((s) => (
                          <option key={s.id} value={s.shiftName}>
                            {s.shiftName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start Time */}
                    <div className="col-md-3">
                      <label className="form-label">Start Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={currentConfig.startTime || ""}
                        onChange={(e) =>
                          setCurrentConfig({ ...currentConfig, startTime: e.target.value })
                        }
                      />
                    </div>

                    {/* End Time */}
                    <div className="col-md-3">
                      <label className="form-label">End Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={currentConfig.endTime || ""}
                        onChange={(e) =>
                          setCurrentConfig({ ...currentConfig, endTime: e.target.value })
                        }
                      />
                    </div>

                    {/* Status Name */}
                    <div className="col-md-3">
                      <label className="form-label">Status Name</label>
                      <select
                        className="form-select"
                        value={currentConfig.statusName || ""}
                        onChange={(e) =>
                          setCurrentConfig({ ...currentConfig, statusName: e.target.value })
                        }
                      >
                        <option value="">Select status</option>
                        {statuses.map((s) => (
                          <option key={s.id} value={s.statusName}>
                            {s.statusName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={handleSaveUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="deleteModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">Are you sure you want to delete this configuration?</div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2000 }}>
        {toasts.map((t) => (
          <div key={t.id} className={`toast show text-white bg-${t.type} mb-2`}>
            <div className="d-flex">
              <div className="toast-body">{t.message}</div>
              <button
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              ></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
