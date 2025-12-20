const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const http = require("http");
const { initSocket } = require("./socket/socket.js");

const app = express();
const PORT = process.env.PORT || 7000;

/* =======================
   CORS (PUT THIS FIRST)
   ======================= */
app.use(
  cors({
    origin: "*", // TEMP – allow all (lock to Vercel later)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  })
);

/* =======================
   MIDDLEWARES
   ======================= */
app.use(express.json());
app.use(fileUpload());

/* =======================
   ROUTES
   ======================= */
const usersRoute = require("./Routes/user_routes");
app.use("/api/users", usersRoute);

/** Login/logout route */
const loginLogoutRoute = require("./Routes/loginLogout_route");
app.use("/api/user", loginLogoutRoute);

/** Password route */
const passwordroute = require("./Routes/password_route");
app.use("/api/user", passwordroute);

/** Configuration route */
const configurationRoute = require("./Routes/configuration_routes");
app.use("/api/configurations", configurationRoute);

/** Status Routes */
const statusRoute = require("./Routes/status_routes");
app.use("/api/status", statusRoute);

/** Request route */
const requestRoute = require("./Routes/request_routes");
app.use("/api/requests", requestRoute);

/** Shift route */
const shiftRoute = require("./Routes/shift_routes");
app.use("/api/shifts", shiftRoute);

/* =======================
   SERVER & SOCKET.IO
   ======================= */
const server = http.createServer(app);

/** Initialize Socket.IO */
initSocket(server);

/** Start server */
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
