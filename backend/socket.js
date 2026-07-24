import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import Booking from './models/bookingModel.js';
import ChatMessage from './models/chatMessageModel.js';
import User from './models/userModel.js';
import ServiceProvider from './models/serviceProviderModel.js';

const getSocketActor = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.userId).select('firstName lastName email');
  if (user) {
    return {
      id: String(user._id),
      model: 'User',
      name: `${user.firstName} ${user.lastName}`.trim() || user.email,
      email: user.email,
    };
  }

  const provider = await ServiceProvider.findById(decoded.userId).select('firstName lastName email');
  if (provider) {
    return {
      id: String(provider._id),
      model: 'ServiceProvider',
      name: `${provider.firstName} ${provider.lastName}`.trim() || provider.email,
      email: provider.email,
    };
  }

  throw new Error('Actor not found');
};

const serializeMessage = (message) => ({
  _id: String(message._id),
  bookingId: String(message.bookingId),
  senderId: String(message.senderId),
  senderModel: message.senderModel,
  senderName: message.senderName,
  message: message.message,
  createdAt: message.createdAt,
});

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const actor = await getSocketActor(token);
      socket.data.actor = actor;
      next();
    } catch (error) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('chat:join', async ({ bookingId }, callback = () => {}) => {
      try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
          callback({ error: 'Booking not found' });
          return;
        }

        const actorId = socket.data.actor.id;
        const isParticipant =
          actorId === String(booking.userId) ||
          actorId === String(booking.serviceProviderId);

        if (!isParticipant) {
          callback({ error: 'You are not allowed to view this chat' });
          return;
        }

        const roomId = String(booking._id);
        socket.join(roomId);

        const messages = await ChatMessage.find({ bookingId: booking._id }).sort({ createdAt: 1 });

        callback({
          roomId,
          messages: messages.map(serializeMessage),
        });
      } catch (error) {
        callback({ error: 'Failed to join chat room' });
      }
    });

    socket.on('chat:message', async ({ bookingId, message }, callback = () => {}) => {
      try {
        if (!message || !message.trim()) {
          callback({ error: 'Message cannot be empty' });
          return;
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
          callback({ error: 'Booking not found' });
          return;
        }

        const actor = socket.data.actor;
        const isParticipant =
          actor.id === String(booking.userId) ||
          actor.id === String(booking.serviceProviderId);

        if (!isParticipant) {
          callback({ error: 'You are not allowed to send messages here' });
          return;
        }

        const createdMessage = await ChatMessage.create({
          bookingId: booking._id,
          senderId: actor.id,
          senderModel: actor.model,
          senderName: actor.name,
          message: message.trim(),
        });

        const payload = serializeMessage(createdMessage);
        io.to(String(booking._id)).emit('chat:message', payload);
        callback({ ok: true, message: payload });
      } catch (error) {
        callback({ error: 'Failed to send message' });
      }
    });
  });

  return io;
};