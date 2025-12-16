import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import socket from "./socket";

// Auth
import { Login } from "./components/auth/Login";
import { Logout } from "./components/auth/Logout";
import { ProtectedRoute } from "./components/auth/ProtectRoute";

// Welcome Page
import { Layout } from "./components/pages/LayoutPage";
import { WelcomePage } from "./components/pages/WelcomePage";

// Navbar
import { Navbar } from "./components/navbar/Navbar";

// Users
import { CreateUser } from "./components/users/CreateUser";
import UploadUsers from "./components/users/UploadUsers";
import { ReadUsers } from "./components/users/ViewUsers";
import { ReadUserById } from "./components/users/ReadUserById";
import { UpdateUser } from "./components/users/UpdateUser";
import { DeleteUser } from "./components/users/DeleteUser";

// Password
import { ResetPassword } from "./components/password/ResetPassword";
import { ChangePassword } from "./components/password/ChangePassword";

// Requests
import { ViewAllStatus } from "./components/request/ViewAllStatus";

// System Configurations
import { CreateConfiguration } from "./components/configuration/CreateConfiguration";
import { ViewConfigurations } from "./components/configuration/ViewConfigurations";

// Shift Management
import { ManageShiftSchedule } from "./components/shift/ManageShiftSchedule";


// Status Management
import { ManageStatusType } from "./components/status/ManageStatusType";

// Feedback
import { FeedbackForm } from "./components/feedback/FeedbackForm";

// Channels and Skills Dashboard
import { ChannelsDashboard } from "./components/dashboard/ChannelsDashboard";

// Report
import { ReportExcel } from "./components/report/ReportExcel";

import  {CreateRequest }from "./components/request/createRequest";
import { CoachCreateRequest } from "./components/request/CoachCreateRequest";




function App() {
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [role, setRole] = useState(null);
const [delegatedRole, setDelegatedRole] = useState(null);
const [loading, setLoading] = useState(true); // Prevent premature render

useEffect(() => {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");
  const storedDelegatedRole = localStorage.getItem("delegatedRole"); // rename to avoid shadowing

  if (token) {
    setIsLoggedIn(true);
    setRole(storedRole || null);
    setDelegatedRole(storedDelegatedRole || null);
  } else {
    setIsLoggedIn(false);
    setRole(null);
    setDelegatedRole(null);
  }

  setLoading(false); // done loading
}, []);

  // Global Socket Listeners
  useEffect(() => {
    const events = [
      "requestCreated", "requestApproved", "requestCanceled", "requestDeleted", "statusAutoSet",
      "configCreated", "configUpdated", "configDeleted"
    ];

    events.forEach(event => {
      socket.on(event, (data) => {
        console.log(`📡 ${event}:`, data);
      });
    });

    return () => {
      events.forEach(event => socket.off(event));
    };
  }, []);

  // ✅ Show nothing while loading auth state
  if (loading) return null;

  return (
    <Router>

      {isLoggedIn ? (
        <Layout>
          <Navbar role={role} delegatedRole={delegatedRole} />
          <div style={{ marginLeft: "200px" }}>
            <Routes>
              {/* Auth */}
              <Route path="/logout" element={<Logout setIsLoggedIn={setIsLoggedIn} setRole={setRole} />} />

              {/* Welcome */}
              <Route
                path="/welcome"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <WelcomePage />
                  </ProtectedRoute>
                }
              />
              {/* Channels Dashboard */}
              <Route
                path="/channels-dashboard"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <ChannelsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />

              {/* Users */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <ReadUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-user"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <CreateUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload-users"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <UploadUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search-user"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <ReadUserById />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/update-user"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <UpdateUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/delete-user"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <DeleteUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <ResetPassword />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/check-status"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <ViewAllStatus />
                  </ProtectedRoute>
                }
              />
              
              {/* History Report */}
              <Route
                path="/history-report"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <ReportExcel/>
                  </ProtectedRoute>
                }
              />

              {/* Create configurations */}
              <Route
                path="/create-configuration"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <CreateConfiguration/>
                  </ProtectedRoute>
                }
              />
              {/* View configurations */}
              <Route
                path="/view-configurations"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <ViewConfigurations />
                  </ProtectedRoute>
                }
              />
            {/* Manage shift configurations */}
              <Route
                path="/configure-shift"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <ManageShiftSchedule />
                  </ProtectedRoute>
                }
              />
              {/* Manage status configurations */}
              <Route
                path="/configure-status"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <ManageStatusType />
                  </ProtectedRoute>
                }
              />
              {/*newly added////////////////////////// */}
              <Route
  path="/create-request"
  element={
    <ProtectedRoute isLoggedIn={isLoggedIn}>
      <CreateRequest />
    </ProtectedRoute>
  }
/>

<Route
  path="/coach/create-request"
  element={
    <ProtectedRoute isLoggedIn={isLoggedIn}>
      <CoachCreateRequest />
    </ProtectedRoute>
  }
/>
              {/* Feedback */}
              <Route
                path="/feedback"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <FeedbackForm />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route for Authenticated Users */}
              {/* <Route path="*" element={<Navigate to="/welcome" />} /> */}
            </Routes>
          </div>
        </Layout>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setRole={setRole} setDelegatedRole={setDelegatedRole}/>} />
          {/* Fallback Route for Unauthenticated Users */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
