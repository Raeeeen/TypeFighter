import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let connecting: Promise<Socket> | null = null;

export async function getSocket(): Promise<Socket> {
  if (socket?.connected) return socket;
  if (connecting) return connecting;

  connecting = (async () => {
    const res = await fetch("/api/socket-token");
    const { token } = await res.json();

    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
      transports: ["websocket"],
    });

    socket = s;
    connecting = null;
    return s;
  })();

  return connecting;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  connecting = null;
}