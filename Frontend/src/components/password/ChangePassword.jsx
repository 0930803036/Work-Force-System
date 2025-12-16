import { useState } from "react";

export function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:7000/api";

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill out all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/user/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to change password");

      setMessage(data.message);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <h2 className="mb-4">Change Password</h2>

      <div className="mb-3 w-50">
        <input
          type="password"
          className="form-control"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
      </div>

      <div className="mb-3 w-50">
        <input
          type="password"
          className="form-control"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div className="mb-3 w-50">
        <input
          type="password"
          className="form-control"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <button className="btn btn-primary mb-3" onClick={handleChangePassword} disabled={loading}>
        {loading ? "Changing..." : "Change Password"}
      </button>

      {message && <p className="text-success">{message}</p>}
      {error && <p className="text-danger">{error}</p>}
    </div>
  );
}
