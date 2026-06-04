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

/**
 * Subscribe ke room session dan panggil onJoined setelah server confirm join.
 * Menggunakan Socket.io acknowledgment agar kita tahu persis kapan client
 * sudah masuk room — ini mencegah race condition di mana move event
 * di-broadcast sebelum client join room.
 */
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
