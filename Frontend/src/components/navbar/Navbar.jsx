import { useState } from "react";
import { NavLink } from "react-router-dom";

export function Navbar({ role, delegatedRole }) {
  const [openMenu, setOpenMenu] = useState(null);
console.log("Navbar role prop:", role, "delegatedRole prop:", delegatedRole);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-primary text-decoration-none d-block py-1"
      : "text-dark text-decoration-none d-block py-1";

  return (
    <nav
      className="bg-light text-dark p-1"
      style={{
        width: "200px",
        minHeight: "100vh",
        position: "fixed",
        top: "40px",
        left: 0,
        overflowY: "auto",
        borderRight: "1px solid #ddd",
        zIndex: 1030,
      }}
    >
      <h5 className="text-success mt-3 fw-bold">
        <i className="bi bi-list fs-3 hamburger"></i> Menu
      </h5>

      {/* Dashboard - visible to all roles */}
      <div className="mb-2">
        <button onClick={() => toggleMenu("dashboard")} className="btn btn-light  w-100 text-start">
          <i className="bi bi-grid-fill fs-5"></i> Dashboard
        </button>
        {openMenu === "dashboard" && (
          <ul className="list-unstyled ps-4 mt-2">
            <li><NavLink to="/channels-dashboard" className={linkClass}>Channels Dashboard</NavLink></li>
          </ul>
        )}
      </div>

      {/* Manage Users - only for admins */}
      {(role === "admin"|| delegatedRole === "admin" ) && (
        <div className="mb-2">
          <button onClick={() => toggleMenu("users")} className="btn btn-light w-100 text-start">
            <i className="bi bi-people-fill fs-5"></i> Manage Users
          </button>
          {openMenu === "users" && (
            <ul className="list-unstyled ps-4 mt-2">
              <li><NavLink to="/create-user" className={linkClass}>Add User</NavLink></li>
              {/* <li><NavLink to="/upload-users" className={linkClass}>Upload Users</NavLink></li> */}
              <li><NavLink to="/users" className={linkClass}>View Users</NavLink></li>
              <li><NavLink to="/manage-user-status" className={linkClass}>Manage user status</NavLink></li>
              <li><NavLink to="/reset-password" className={linkClass}>Reset Password</NavLink></li>

            </ul>
          )}
        </div>
      )}

     {/* Configuration - visible to admin only */}
       {role === "admin" && (
      <div className="mb-2">
        <button onClick={() => toggleMenu("configuration")} className="btn btn-light  w-100 text-start">
          <i className="bi bi-gear-fill fs-5"></i> Configuration
        </button>
        {openMenu === "configuration" && (
          <ul className="list-unstyled ps-4 mt-2">
            <li><NavLink to="/configure-status" className={linkClass}>Status list</NavLink></li>
            <li><NavLink to="/configure-shift" className={linkClass}>Shift schedule</NavLink></li>
            <li><NavLink to="/create-configuration" className={linkClass}>Create configuration</NavLink></li>
            <li><NavLink to="/view-configurations" className={linkClass}>View configurations</NavLink></li>
            </ul>
        )}
      </div>
       )}

      {/* Requests - visible to all users */}
      <div className="mb-2">
        <button onClick={() => toggleMenu("requests")} className="btn btn-light w-100 text-start">
          <i className="bi bi-question-circle-fill fs-5"></i> Requests
        </button>
        {openMenu === "requests" && (
          <ul className="list-unstyled ps-4 mt-2"> 
            {/* Only users see this */}
             {role === "agent" && (
              <>
    <li><NavLink to="/create-request" className={linkClass}>Create Request</NavLink></li>
    <li><NavLink to="/requests/status" className={linkClass}>View My Status</NavLink></li>
  </>
             )}
             {role === "coach" && (
  <>
    <li><NavLink to="/coach/create-request" className={linkClass}>Create Request</NavLink></li>
    <li><NavLink to="/check-status" className={linkClass}>View Agents</NavLink></li>
  </>
)}
              {/* Only admins/managers see this */}
            {(role === "admin" || role === "manager") && (
              <li><NavLink to="/check-status" className={linkClass}>View All Status</NavLink></li>
            )}
          </ul>
        )}
      </div>

      {/* Report - only for admin & manager */}
      {/* {(role === "admin" || role === "manager") && (  */}
        <div className="mb-2">
          <button onClick={() => toggleMenu("report")} className="btn btn-light w-100 text-start">
            <i className="bi bi-bar-chart-fill fs-5"></i> Report
          </button>
        </div>
      {/* )} */}

      {/* Feedback - available to all */}
      <div className="mb-2">
        <button onClick={() => toggleMenu("feedback")} className="btn btn-light w-100 text-start">
          <i className="bi bi-chat-left-text-fill fs-5"></i> Feedback
        </button>
        {openMenu === "feedback" && (
          <ul className="list-unstyled ps-4 mt-2">
            <li><NavLink to="/feedback" className={linkClass}>Your Comment</NavLink></li>
          </ul>
        )}
      </div>

      {/* Profile - always available */}
      <div className="mb-2">
        <button onClick={() => toggleMenu("profile")} className="btn btn-light w-100 text-start">
          <i className="bi bi-person-fill fs-5"></i> Profile
        </button>
        {openMenu === "profile" && (
          <ul className="list-unstyled ps-4 mt-2">
            <li><NavLink to="/profile" className={linkClass}>User Profile</NavLink></li>
            <li><NavLink to="/change-password" className={linkClass}>Change Password</NavLink></li>
            <li><NavLink to="/logout" className={linkClass}>Logout </NavLink></li>
          </ul>
        )}
      </div>
    </nav>
  );
}
