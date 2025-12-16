// import { io } from "socket.io-client";

// const socket = io("http://localhost:7000"); // Adjust backend URL if needed

// export default socket;



import { io } from "socket.io-client";

const socket = io("http://localhost:7000", {
  transports: ["websocket", "polling"],
  autoConnect: true,
});

export default socket;

