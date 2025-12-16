import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function Logout({ setIsLoggedIn, setRole }) {
  const navigate = useNavigate();
  const hasLoggedOut = useRef(false); // prevent double logout in StrictMode

  useEffect(() => {
    if (hasLoggedOut.current) return; // run only once
    hasLoggedOut.current = true;

    // Call backend logout API
    fetch("http://localhost:7000/api/user/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(() => {
        // Clear token and role from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        // Update UI state
        setIsLoggedIn(false);
        setRole(null);

        // Redirect to login
        navigate("/login");
      })
      .catch((err) => {
        console.error("Logout failed", err);
      });
  }, [navigate, setIsLoggedIn, setRole]);

  return <p>Logging out...</p>;
}
