import { useEffect } from "react";
import { useSocket } from "./socket-context";

export function useSocketEvent<T = any>(eventName: string, handler: (data: T) => void) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, eventName, handler]);
}
