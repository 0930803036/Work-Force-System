import { useState } from "react";

export function ResetPassword() {
  const [userId, setUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:7000/api";

  const handleReset = async () => {
    if (!userId || !newPassword) {
      setError("Please enter User ID and New Password");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const token = localStorage.getItem("token"); // admin JWT
      const response = await fetch(`${API_URL}/user/reset-password/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to reset password");

      setMessage(data.message);
      setUserId("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="d-flex flex-column align-items-center">
  <h2 className="mb-4">Reset User Password</h2>

  <div className="mb-3 w-50">
    <label className="form-label">User Id:</label>
    <input
      type="number"
      className="form-control"
      placeholder="Enter User ID"
      value={userId}
      onChange={(e) => setUserId(e.target.value)}
    />
  </div>

  <div className="mb-3 w-50">
    <label className="form-label">New Password:</label>
    <input
      type="password"
      className="form-control"
      placeholder="Enter New Password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
    />
  </div>

  <button className="btn btn-primary mb-3" onClick={handleReset} disabled={loading}>
    {loading ? "Resetting..." : "Reset Password"}
  </button>

  {message && <p className="text-success">{message}</p>}
  {error && <p className="text-danger">{error}</p>}
</div>

  );
}
