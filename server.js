const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev });
const handler = app.getRequestHandler();

const INACTIVE_AFTER_MS = 5000;
const GC_SUBMITTED_AFTER_MS = 1000 * 60 * 30; // drop submitted sessions after 30 min

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  /** sessionId -> { data, status, updatedAt, submittedAt? } */
  const sessions = new Map();

  const snapshot = () =>
    Array.from(sessions.entries()).map(([id, s]) => ({ id, ...s }));

  const broadcastUpdate = (id) => {
    const s = sessions.get(id);
    if (!s) return;
    io.to("staff").emit("session:update", { id, ...s });
  };

  io.on("connection", (socket) => {
    const role = socket.handshake.query.role;

    if (role === "staff") {
      socket.join("staff");
      socket.emit("sessions:snapshot", snapshot());
      // Allow staff clients to re-request the snapshot after a route remount.
      socket.on("staff:snapshot", () => socket.emit("sessions:snapshot", snapshot()));
      return;
    }

    const sessionId = socket.id;
    sessions.set(sessionId, {
      data: {},
      status: "active",
      updatedAt: Date.now(),
    });
    broadcastUpdate(sessionId);

    // Allow the client to rehydrate the form after a route remount.
    socket.on("patient:state", () => {
      const s = sessions.get(sessionId);
      if (!s) return;
      socket.emit("patient:state", { data: s.data, status: s.status });
    });

    socket.on("patient:update", (partial) => {
      const s = sessions.get(sessionId);
      if (!s || s.status === "submitted") return;
      s.data = { ...s.data, ...partial };
      s.status = "active";
      s.updatedAt = Date.now();
      broadcastUpdate(sessionId);
    });

    // Wipe the session immediately. Used by the Clear button and "Submit
    // another" so the server doesn't hold stale values during a fast
    // route remount.
    socket.on("patient:reset", () => {
      const s = sessions.get(sessionId);
      if (!s) return;
      s.data = {};
      s.status = "active";
      s.updatedAt = Date.now();
      delete s.submittedAt;
      broadcastUpdate(sessionId);
    });

    socket.on("patient:submit", (fullData) => {
      const s = sessions.get(sessionId);
      if (!s) return;
      s.data = fullData;
      s.status = "submitted";
      s.updatedAt = Date.now();
      s.submittedAt = Date.now();
      broadcastUpdate(sessionId);
    });

    socket.on("disconnect", () => {
      const s = sessions.get(sessionId);
      // Keep submitted records around briefly so staff can still see them.
      if (s && s.status === "submitted") return;
      sessions.delete(sessionId);
      io.to("staff").emit("session:leave", { id: sessionId });
    });
  });

  // Periodic tick: flip stale active sessions to inactive, GC old submits.
  setInterval(() => {
    const now = Date.now();
    for (const [id, s] of sessions.entries()) {
      if (s.status === "submitted") {
        if (s.submittedAt && now - s.submittedAt > GC_SUBMITTED_AFTER_MS) {
          sessions.delete(id);
          io.to("staff").emit("session:leave", { id });
        }
        continue;
      }
      const shouldBeInactive = now - s.updatedAt > INACTIVE_AFTER_MS;
      const nextStatus = shouldBeInactive ? "inactive" : "active";
      if (nextStatus !== s.status) {
        s.status = nextStatus;
        broadcastUpdate(id);
      }
    }
  }, 2000);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
