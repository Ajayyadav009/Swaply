import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  autoConnect: false,
  reconnection: true,           // ← auto reconnect
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']  // ← try websocket first
});

export default socket;