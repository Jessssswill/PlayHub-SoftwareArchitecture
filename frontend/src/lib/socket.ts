import { io, Socket } from 'socket.io-client';

// Singleton — one connection shared across the app
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
};

export const subscribeToSession = (sessionId: string): Socket => {
  const s = getSocket();
  s.emit('subscribe', { sessionId });
  return s;
};

export const unsubscribeFromSession = (sessionId: string): void => {
  if (socket) {
    socket.emit('unsubscribe', { sessionId });
  }
};
