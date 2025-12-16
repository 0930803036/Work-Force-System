import { useState } from "react";
import UploadUsers from "./UploadUsers";
import DeleteAllUsersButton from "./DeleteAllUsers";

const API_URL = "http://localhost:7000/api";

export function CreateUser() {
  const [form, setForm] = useState({
    userId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    skillSet: "",
    channel: "",
    coachGroup: "",
    supervisorGroup: "",
    managerGroup: "",
    site: "",
    director: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setValidationErrors([]);

    try {
      const payload = { ...form, userId: Number(form.userId) };

      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          let errorList = [];
          if (Array.isArray(data.errors)) {
            errorList = data.errors.map((err) => {
              if (typeof err === "string") return err;
              if (err.msg && err.path) return `${err.path}: ${err.msg}`;
              if (err.message) return err.message;
              return JSON.stringify(err);
            });
          } else if (typeof data.errors === "object") {
            errorList = Object.entries(data.errors).map(([field, msg]) => {
              if (typeof msg === "object") return `${field}: ${JSON.stringify(msg)}`;
              return `${field}: ${msg}`;
            });
          }
          setValidationErrors(errorList);
          throw new Error("Validation failed");
        } else {
          throw new Error(data.message || "Failed to add user");
        }
      }

      setMessage(`User ${data.firstName} ${data.middleName || ""} added successfully!`);

      setForm({
        userId: "",
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        skillSet: "",
        channel: "",
        coachGroup: "",
        supervisorGroup: "",
        managerGroup: "",
        site: "",
        director: "",
        password: "",
      });
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="container mt-2 bg-light rounded">
      <h4 className="m-2 p-2">Create User</h4>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* Row 1: IDs and Names */}
          <div className="col-md-3 form-floating">
            <input type="number" name="userId" className="form-control" placeholder="User ID" value={form.userId} onChange={handleChange} min={1} required />
            <label>User Id</label>
          </div>
          <div className="col-md-3 form-floating">
            <input type="text" name="firstName" className="form-control" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
            <label>First Name</label>
          </div>
          <div className="col-md-3 form-floating">
            <input type="text" name="middleName" className="form-control" placeholder="Middle Name" value={form.middleName} onChange={handleChange} />
            <label>Middle Name</label>
          </div>
          <div className="col-md-3 form-floating">
            <input type="text" name="lastName" className="form-control" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
            <label>Last Name</label>
          </div>

          {/* Row 2: Email, Phone, Password, Role */}
          <div className="col-md-3 form-floating">
            <input type="email" name="email" className="form-control" placeholder="Email" value={form.email} onChange={handleChange} />
            <label>Email</label>
          </div>
          <div className="col-md-3 form-floating">
            <input type="text" name="phone" className="form-control" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <label>Phone</label>
          </div>
          <div className="col-md-3 form-floating">
            <input type="password" name="password" className="form-control" placeholder="Password" value={form.password} onChange={handleChange} />
            <label>Password</label>
          </div>
          <div className="col-md-3 form-floating">
            <select name="role" className="form-select" value={form.role} onChange={handleChange} required>
              <option value="">Select Role</option>
              <option value="agent">Agent</option>
              <option value="coach">Coach</option>
              <option value="supervisor">Supervisor</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="super admin">Super Admin</option>
            </select>
            <label>Role</label>
          </div>

          {/* Row 3: SkillSet, Channel */}
          <div className="col-md-3 form-floating">
            <select name="skillSet" className="form-select" value={form.skillSet} onChange={handleChange}>
              <option value="">Select Skill/Language</option>
              <option value="Amharic">Amharic</option>
              <option value="English">English</option>
              <option value="Oromifa">Oromifa</option>
              <option value="Somali">Somali</option>
              <option value="Tigrigna">Tigrigna</option>
            </select>
            <label>Skill Set</label>
          </div>
          <div className="col-md-3 form-floating">
            <select name="channel" className="form-select" value={form.channel} onChange={handleChange} required>
              <option value="">Select Channel</option>
              <option value="126">126</option>
              <option value="127">127</option>
              <option value="8994">8994</option>
              <option value="980">980</option>
              <option value="994">994</option>
            </select>
            <label>Channel</label>
          </div>

          {/* Row 4: Groups */}
          <div className="col-md-3 form-floating">
            <input type="text" name="coachGroup" className="form-control" placeholder="Coach Group" value={form.coachGroup} onChange={handleChange} />
            <label>Coach Group</label>
          </div>
          <div className="col-md-3 form-floating">
            <input type="text" name="supervisorGroup" className="form-control" placeholder="Supervisor Group" value={form.supervisorGroup} onChange={handleChange} />
            <label>Supervisor Group</label>
          </div>
          <div className="col-md-3 form-floating">
            <input type="text" name="managerGroup" className="form-control" placeholder="Manager Group" value={form.managerGroup} onChange={handleChange} />
            <label>Manager Group</label>
          </div>

          {/* Row 5: Site and Director */}
          <div className="col-md-3 form-floating">
            <input type="text" name="site" className="form-control" placeholder="Site" value={form.site} onChange={handleChange} />
            <label>Site</label>
          </div>
          <div className="col-md-3 form-floating">
            <input type="text" name="director" className="form-control" placeholder="Director" value={form.director} onChange={handleChange} />
            <label>Director</label>
          </div>
        </div>

        {/* Buttons */}
        <div className="text-center d-flex mt-3">
          <button type="submit" className="btn btn-primary m-2">Add User</button>
          <button type="button" className="btn btn-success m-2" data-bs-toggle="modal" data-bs-target="#uploadModal">
            <i className="bi bi-upload"></i> Bulk Upload
          </button>
          <button type="button" className="btn btn-danger m-2" data-bs-toggle="modal" data-bs-target="#deleteModal">
            <i className="bi bi-trash"></i> Delete all
          </button>
        </div>
      </form>

      {/* Messages */}
      {message && (
        <p className={`mt-3 text-center ${message.includes("added successfully") ? "text-success" : "text-danger"}`}>
          {message}
        </p>
      )}
      {validationErrors.length > 0 && (
        <div className="alert alert-warning mt-3">
          <h6 className="text-danger mb-2">Validation Errors:</h6>
          <ul className="mb-0">{validationErrors.map((err, idx) => <li key={idx}>{err}</li>)}</ul>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <div className="modal fade" id="uploadModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog"><div className="modal-content"><div className="modal-header">
          <h5 className="modal-title">Bulk Upload Users</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
        </div><div className="modal-body"><UploadUsers /></div></div></div>
      </div>

      {/* Delete All Users Modal */}
      <div className="modal fade" id="deleteModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog"><div className="modal-content"><div className="modal-header">
          <h5 className="modal-title">Delete All Users</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
        </div><div className="modal-body"><DeleteAllUsersButton /></div></div></div>
      </div>
    </div>
  );
}
