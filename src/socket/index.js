// /src/socket/index.js
import { io } from "socket.io-client";
import { BACKEND_URL } from "../utils/index.js";

const socket = io(BACKEND_URL, {
  transports: ["websocket"], // skip polling
  path: "/socket.io",        // default
});

socket.on("connect", () => {
//   console.log("✅ Connected to server:", socket.id);
});

socket.on("welcome", (msg) => {
//   console.log("📩 Welcome:", msg);
});

socket.on("message", (msg) => {
//   console.log("📨 Message:", msg);
});

export default socket;
