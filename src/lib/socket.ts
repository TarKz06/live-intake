"use client";

import { io, type Socket } from "socket.io-client";

let patientSocket: Socket | null = null;
let staffSocket: Socket | null = null;

export function getPatientSocket(): Socket {
  if (!patientSocket) {
    patientSocket = io({ query: { role: "patient" }, transports: ["websocket", "polling"] });
  }
  return patientSocket;
}

export function getStaffSocket(): Socket {
  if (!staffSocket) {
    staffSocket = io({ query: { role: "staff" }, transports: ["websocket", "polling"] });
  }
  return staffSocket;
}
