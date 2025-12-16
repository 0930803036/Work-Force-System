import { useState } from "react";

export function UpdateUser() {
  const [userId, setUserId] = useState(""); // search input
  const [user, setUser] = useState(null);   // fetched user
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch user by ID
  const fetchUser = async () => {
    if (!userId) {
      setError("Please enter a user ID");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`http://localhost:7777/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("User not found");
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
      
    }
  };

  // Update user
  const updateUser = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = { ...user }; // send all fields except password
      const response = await fetch(`http://localhost:7777/users/${user.userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update user");

      setSuccess("User updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUserId(""); //set free the field after updating
      setUser(""); //close the field after updating
    }
  };

  return (
    <>
      <h3>Update User</h3>

      {/* Search box */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Enter user ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="form-control d-inline-block w-auto"
        />
        <button onClick={fetchUser} className="btn btn-primary btn-sm m-2">Search</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {user && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateUser();
          }}
          className="container"
        >
          {/* Row 1 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label>First Name</label>
              <input
                type="text"
                className="form-control"
                value={user.firstName || ""}
                onChange={(e) => setUser({ ...user, firstName: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label>Middle Name</label>
              <input
                type="text"
                className="form-control"
                value={user.middleName || ""}
                onChange={(e) => setUser({ ...user, middleName: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label>Last Name</label>
              <input
                type="text"
                className="form-control"
                value={user.lastName || ""}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label>User Name</label>
              <input
                type="text"
                className="form-control"
                value={user.userName || ""}
                onChange={(e) => setUser({ ...user, userName: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label>Role</label>
              <select
                className="form-control"
                value={user.role || ""}
                onChange={(e) => setUser({ ...user, role: e.target.value })}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="coach">Coach</option>
                <option value="sup">Supervisor</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div className="col-md-4">
              <label>Skill Set</label>
              <select
                className="form-control"
                value={user.skillSet || ""}
                onChange={(e) => setUser({ ...user, skillSet: e.target.value })}
              >
                <option value="">Select Language</option>
                <option value="Amharic">Amharic</option>
                <option value="English">English</option>
                <option value="Oromifa">Oromifa</option>
                <option value="Somali">Somali</option>
                <option value="Tigrigna">Tigrigna</option>
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label>Channel</label>
              <select
                className="form-control"
                value={user.channel || ""}
                onChange={(e) => setUser({ ...user, channel: e.target.value })}
              >
                <option value="">Select Channel</option>
                <option value="126">126</option>
                <option value="127">127</option>
                <option value="8994">8994</option>
                <option value="980">980</option>
                <option value="994">994</option>
              </select>
            </div>
            <div className="col-md-4">
              <label>Coach Group</label>
              <input
                type="text"
                className="form-control"
                value={user.coachGroup || ""}
                onChange={(e) => setUser({ ...user, coachGroup: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label>Supervisor Group</label>
              <input
                type="text"
                className="form-control"
                value={user.supGroup || ""}
                onChange={(e) => setUser({ ...user, supGroup: e.target.value })}
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label>Manager Group</label>
              <input
                type="text"
                className="form-control"
                value={user.managerGroup || ""}
                onChange={(e) => setUser({ ...user, managerGroup: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">Update User</button>
        </form>
      )}
    </>
  );
}
