import { io, Socket } from 'socket.io-client';

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

export const subscribeToSession = (sessionId: string, onJoined?: () => void): Socket => {
  const s = getSocket();
  if (onJoined) {
    s.emit('subscribe', { sessionId }, onJoined);
  } else {
    s.emit('subscribe', { sessionId });
  }
  return s;
};

export const unsubscribeFromSession = (sessionId: string): void => {
  if (socket) {
    socket.emit('unsubscribe', { sessionId });
  }
};
