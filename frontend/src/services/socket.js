import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const createChatSocket = () =>
  io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
  });

export default SOCKET_URL;
