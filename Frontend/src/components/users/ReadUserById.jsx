import { useState } from "react";

export function ReadUserById() {
  const [userId, setUserId] = useState("");   // input value
  const [user, setUser] = useState(null);     // fetched user
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    if (!userId) {
      setError("Please enter a user ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:7777/users/${userId}`);
      if (!response.ok) {
        throw new Error("User not found");
      }
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
      setUserId("");
    }
  };

  return (
    <>
    <div className="align-items-center">
      <h3>Search User by ID</h3>
      {/* Search input */}
      <input
        type="text"
        placeholder="Enter user ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={fetchUser}>Search</button>
    </div>
      {/* Loading / error / result */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {user && (
      <table class="table table-bordered table-striped table-hover mt-2">
        <thead className="table-primary">
          <tr>
            <th>User Id</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Middle Name</th>
            <th>User Name</th>
            <th>Password</th>
            <th>Role</th>
            <th>Skill Set</th>
            <th>Channel</th>
            <th>Coach Group</th>
            <th>Supervisor Group</th>
            <th>Manager Group</th>
            <th>Actions</th>

          </tr>
        </thead>
        <tbody>
            <tr key={user.userId}>
              <td>{user.userId}</td>
              <td>{user.firstName}</td>
              <td>{user.MiddleName}</td>
              <td>{user.lastName}</td>
              <td>{user.userName}</td>
              <td>{"********"}</td> {/* hide raw password */}
              <td>{user.role}</td> 
              <td>{user.skillSet}</td>
              <td>{user.channel}</td>
              <td>{user.coachGroup}</td>
              <td>{user.supGroup}</td>
              <td>{user.managerGroup}</td>
              
            </tr>
        </tbody>
      </table>
      )}
    </>
  );
}
