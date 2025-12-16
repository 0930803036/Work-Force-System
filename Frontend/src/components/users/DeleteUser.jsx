import { useState } from "react";

export function DeleteUser() {
  const [userId, setUserId] = useState("");   // search input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Delete user by ID
  const deleteUser = async () => {
    if (!userId) {
      setError("Please enter a user ID");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user ${userId}?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`http://localhost:7777/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setSuccess(`User with ID ${userId} deleted successfully!`);
      setUserId(""); // clear input
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Delete User</h1>

      {/* Input box */}
      <input
        type="text"
        placeholder="Enter user ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={deleteUser}>Delete</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </>
  );
}
