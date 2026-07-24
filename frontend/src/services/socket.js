import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const createChatSocket = (token) =>
  io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    auth: {
      token,
    },
  });

export default SOCKET_URL;