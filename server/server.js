const http = require("http");
const mongoose = require("mongoose");
const Document = require("./models/Document");
const { Server } = require("socket.io");

// ✅ Connect to MongoDB (clean)
mongoose
  .connect("mongodb://127.0.0.1:27017/google-docs-clone")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

let PORT = process.env.PORT || 5000;

// Create plain Node.js HTTP server
const server = http.createServer();

// Attach socket.io to server with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for testing
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

// ✅ Socket.IO connection
io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);

    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ✅ Helper function
async function findOrCreateDocument(id) {
  if (id == null) return;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}

// ✅ Start server (auto retry if port busy)
function startServer(port) {
  server.listen(port, () => {
    console.log(`🚀 Socket.IO server running at http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("❌ Server error:", err);
    }
  });
}

startServer(PORT);
