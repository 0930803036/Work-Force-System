const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload"); //File upload
const http = require("http");
const { initSocket } = require("./socket/socket.js"); // import initSocket


const app = express();
const PORT = 7000;

// Middleware
app.use(express.json());
app.use(cors());

// File upload middleware
app.use(fileUpload());


const usersRoute = require("./Routes/user_routes");
app.use("/api/users", usersRoute);

/** Login/logout route */
const loginLogoutRoute = require("./Routes/loginLogout_route");
app.use("/api/user", loginLogoutRoute);


/** Password route */
const passwordroute = require("./Routes/password_route");
app.use("/api/user", passwordroute);


/**  Configuration route */
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

/** Create HTTP server */ 
const server = http.createServer(app);

/** Initialize Socket.IO */ 
initSocket(server); // no need to handle events here unless you want custom ones

/** Start server */ 
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
