import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const API_URL = process.env.REACT_APP_API_URL;

export function Login({ setIsLoggedIn, setRole, setDelegatedRole }) {
  const [form, setForm] = useState({ userId: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load remembered credentials
  useEffect(() => {
    const savedUserId = localStorage.getItem("rememberedUserId");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedUserId && savedPassword) {
      setForm({ userId: savedUserId, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = () => {
    setRememberMe(!rememberMe);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
    console.log("user login data ", data)
      if (!res.ok) {
        throw new Error(data.message || "Failed to login");
      }

    if (data.token) {
      // Save token
      localStorage.setItem("token", data.token);

      // Save role
      if (data.role) {
        localStorage.setItem("role", data.role);
        setRole(data.role);
      } else {
        localStorage.removeItem("role");
        setRole(null);
      }

      // Save delegatedRole
      if (data.delegatedRole) {
        localStorage.setItem("delegatedRole", data.delegatedRole);
        // If you have a setDelegatedRole prop, call it
        setDelegatedRole?.(data.delegatedRole);
      } else {
        localStorage.removeItem("delegatedRole");
        setDelegatedRole?.(null);
      }

      setIsLoggedIn(true);

      // Remember me logic
      if (rememberMe) {
        localStorage.setItem("rememberedUserId", form.userId);
        localStorage.setItem("rememberedPassword", form.password);
      } else {
        localStorage.removeItem("rememberedUserId");
        localStorage.removeItem("rememberedPassword");
      }

      navigate("/welcome");
    }


      setMessage("Login successful!");
      setForm({ userId: "", password: "" });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic greeting
  const hour = new Date().getHours();
  const welcome =
    hour < 12
      ? "Good Morning!"
      : hour < 19
      ? "Good Afternoon!"
      : "Good Evening!";

  return (
    <div className="login">
      <h2 className="fw-bold text-primary">{welcome}</h2>
      <h6 className="fw-bold text-success">Login to continue to B&L Management!</h6>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="userId"
          placeholder="Enter user ID"
          value={form.userId}
          onChange={handleChange}
          required
          className="form-control mt-4"
        />

        <div className="position-relative mt-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
            className="form-control"
          />
          <i
            className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              top: "50%",
              right: "10px",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#6c757d",
              fontSize: "1.2rem",
            }}
            title={showPassword ? "Hide password" : "Show password"}
          />
        </div>

        <div className="form-check mt-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={rememberMe}
            onChange={handleCheckboxChange}
            id="rememberMe"
          />
          <label className="form-check-label" htmlFor="rememberMe">
            Remember Me
          </label>
        </div>

        <button className="btn btn-primary mt-4" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-3 ${
            message.toLowerCase().includes("locked") ? "text-warning" : "text-danger"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
