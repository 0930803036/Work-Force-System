import { useState, useEffect } from "react";

const API_URI = "http://localhost:7000/api";

export function CreateConfiguration({ onCreated }) {
  const [formData, setFormData] = useState({
    channel: "",
    skill: "",
    managerGroup: "",
    supervisorGroup: "",
    coachGroup: "",
    teamAvailability: "",
    shiftName: "",
    startTime: "",
    endTime: "",
    statusName: "",
  });

  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [options, setOptions] = useState({
    channels: [],
    skills: [],
    managerGroups: [],
    supervisorGroups: [],
    coachGroups: [],
    shiftName: [],
    statusName: [],
  });

  const [loadingOptions, setLoadingOptions] = useState(true);

  const optionKeyMap = {
    channel: "channels",
    skill: "skills",
    managerGroup: "managerGroups",
    supervisorGroup: "supervisorGroups",
  };

  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Fetch user-related options
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingOptions(true);
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URI}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        const users = Array.isArray(data) ? data : data.users || [];

        setOptions((prev) => ({
          ...prev,
          channels: [...new Set(users.map((u) => u.channel).filter(Boolean))],
          skills: [...new Set(users.map((u) => u.skill).filter(Boolean))],
          managerGroups: [...new Set(users.map((u) => u.managerGroup).filter(Boolean))],
          supervisorGroups: [...new Set(users.map((u) => u.supervisorGroup).filter(Boolean))],
          coachGroups: [...new Set(users.map((u) => u.coachGroup).filter(Boolean))],
        }));
      } catch (err) {
        console.error(err);
        addToast("Failed to load user options", "danger");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch shifts and statuses
  useEffect(() => {
    const fetchShiftAndStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        const shiftRes = await fetch(`${API_URI}/shifts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const shiftData = await shiftRes.json();

        const statusRes = await fetch(`${API_URI}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statusData = await statusRes.json();

        const shiftOptions = Array.isArray(shiftData)
          ? shiftData.map((s) => s.shiftName)
          : Array.isArray(shiftData.shifts)
          ? shiftData.shifts.map((s) => s.shiftName)
          : [];

        const statusOptions = Array.isArray(statusData)
        ? statusData
        : Array.isArray(statusData.statuses)
        ? statusData.statuses.map((s) => s.statusName)
        : [];

        setOptions((prev) => ({
          ...prev,
          shiftName: shiftOptions,
          statusName: statusOptions,
        }));
      } catch (err) {
        console.error(err);
        addToast("Failed to load shift/status options", "danger");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchShiftAndStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        addToast("You must be logged in", "danger");
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        teamAvailability: parseFloat(formData.teamAvailability) || 0,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      const response = await fetch(`${API_URI}/configurations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create configuration");

      addToast("✅ Configuration created successfully!", "success");
      if (onCreated) onCreated(data);

      setFormData({
        channel: "",
        skill: "",
        managerGroup: "",
        supervisorGroup: "",
        coachGroup: "",
        teamAvailability: "",
        shiftName: "",
        startTime: "",
        endTime: "",
        statusName: "",
      });
    } catch (err) {
      addToast(err.message || "Server error", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h5 className="m-2 fw-bold text-center">Create Configuration</h5>

      <form onSubmit={handleSubmit} className="card p-3 shadow-sm">
        {loadingOptions ? (
          <div className="text-center my-3">
            <div className="spinner-border" role="status"></div>
          </div>
        ) : (
          <>
            {/* Row 1: Channel, Skill, Manager, Supervisor */}
            <div className="row g-3 mb-3">
              {["channel","skill","managerGroup","supervisorGroup"].map((field) => (
                <div key={field} className="col-md-3 form-floating">
                  <select
                    id={field}
                    name={field}
                    className="form-select"
                    value={formData[field]}
                    onChange={handleChange}
                  >
                    <option value="">
                      {`Select ${field.replace("Group"," Group")}`}
                    </option>

                    {options[optionKeyMap[field]].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  <label htmlFor={field}>
                    {field.replace("Group"," Group").replace(/^\w/, c => c.toUpperCase())}
                  </label>
                </div>
              ))}
            </div>

            {/* Row 2 */}
            <div className="row g-3 mb-3">
              <div className="col-md-3 form-floating">
                <select
                  id="coachGroup"
                  name="coachGroup"
                  className="form-select"
                  value={formData.coachGroup}
                  onChange={handleChange}
                >
                  <option value="">Select Coach Group</option>
                  {options.coachGroups.map((cg) => (
                    <option key={cg} value={cg}>{cg}</option>
                  ))}
                </select>
                <label htmlFor="coachGroup">Coach Group</label>
              </div>

              <div className="col-md-3 form-floating">
                <input
                  type="number"
                  step="1"
                  id="teamAvailability"
                  name="teamAvailability"
                  className="form-control"
                  value={formData.teamAvailability}
                  onChange={handleChange}
                />
                <label htmlFor="teamAvailability">Team Availability</label>
              </div>

              <div className="col-md-3 form-floating">
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  className="form-control"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="startTime">Start Time</label>
              </div>

              <div className="col-md-3 form-floating">
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  className="form-control"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="endTime">End Time</label>
              </div>
            </div>

            {/* Row 3 */}
            <div className="row g-3 mb-3 align-items-end">
              <div className="col-md-3 form-floating">
                <select
                  id="shiftName"
                  name="shiftName"
                  className="form-select"
                  value={formData.shiftName}
                  onChange={handleChange}
                >
                  <option value="">Select Shift</option>
                  {options.shiftName.map((sn) => (
                    <option key={sn} value={sn}>{sn}</option>
                  ))}
                </select>
                <label htmlFor="shiftName">Shift Name</label>
              </div>

              <div className="col-md-3 form-floating">
                <select
                  id="statusName"
                  name="statusName"
                  className="form-select"
                  value={formData.statusName}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Status</option>
                  {options.statusName.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <label htmlFor="statusName">Status</label>
              </div>

              <div className="col-md-6 d-flex justify-content-end">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating...
                    </>
                  ) : (
                    "Create Configuration"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </form>

      {/* Toast Notifications */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1055, maxWidth: "350px" }}>
        {toasts.map((t) => (
          <div key={t.id} className={`toast show text-white bg-${t.type} border-0 mb-2`} role="alert">
            <div className="d-flex">
              <div className="toast-body">{t.message}</div>
              <button
                type="button"
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
