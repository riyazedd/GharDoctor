import { useEffect, useMemo, useRef, useState } from 'react';
import { createChatSocket } from '../services/socket';

const getUnreadStorageKey = (userId) => `ghardoctor_chat_unread_${userId}`;

export default function useBookingChatNotifications({ bookings = [], currentUser, activeBookingId }) {
  const [unreadCounts, setUnreadCounts] = useState({});
  const [notification, setNotification] = useState(null);
  const socketRef = useRef(null);
  const joinedRoomsRef = useRef(new Set());
  const notificationTimerRef = useRef(null);
  const activeBookingIdRef = useRef(activeBookingId);

  const bookingLookup = useMemo(() => {
    return bookings.reduce((accumulator, booking) => {
      accumulator[String(booking._id)] = booking;
      return accumulator;
    }, {});
  }, [bookings]);

  useEffect(() => {
    activeBookingIdRef.current = activeBookingId;
  }, [activeBookingId]);

  useEffect(() => {
    if (!currentUser?._id) {
      setUnreadCounts({});
      return undefined;
    }

    const storedCounts = localStorage.getItem(getUnreadStorageKey(currentUser._id));
    if (storedCounts) {
      try {
        setUnreadCounts(JSON.parse(storedCounts));
      } catch {
        setUnreadCounts({});
      }
    } else {
      setUnreadCounts({});
    }
  }, [currentUser?._id]);

  useEffect(() => {
    if (!currentUser?._id) {
      return undefined;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return undefined;
    }

    const socket = createChatSocket(token);
    socketRef.current = socket;

    const joinBookingRooms = () => {
      const bookingIds = bookings.map((booking) => String(booking._id));

      bookingIds.forEach((bookingId) => {
        if (joinedRoomsRef.current.has(bookingId)) {
          return;
        }

        socket.emit('chat:join', { bookingId }, (response) => {
          if (!response?.error) {
            joinedRoomsRef.current.add(bookingId);
          }
        });
      });
    };

    const handleIncomingMessage = (message) => {
      const bookingId = String(message.bookingId);
      const senderId = String(message.senderId);

      if (senderId === String(currentUser._id)) {
        return;
      }

      const isActiveBooking = String(activeBookingIdRef.current || '') === bookingId;

      if (!isActiveBooking) {
        setUnreadCounts((previousCounts) => {
          const nextCounts = {
            ...previousCounts,
            [bookingId]: (previousCounts[bookingId] || 0) + 1,
          };

          localStorage.setItem(getUnreadStorageKey(currentUser._id), JSON.stringify(nextCounts));
          return nextCounts;
        });
      }

      const booking = bookingLookup[bookingId];
      setNotification({
        bookingId,
        title: booking?.serviceName || 'New message',
        message: `${message.senderName}: ${message.message}`,
      });

      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }

      notificationTimerRef.current = setTimeout(() => {
        setNotification(null);
      }, 4500);
    };

    socket.on('chat:message', handleIncomingMessage);
    socket.on('connect', joinBookingRooms);
    socket.on('connect_error', () => {
      // Keep the UI usable if the socket cannot connect; messages will resume on reconnect.
    });

    socket.connect();

    if (socket.connected) {
      joinBookingRooms();
    }

    return () => {
      socket.off('chat:message', handleIncomingMessage);
      socket.off('connect', joinBookingRooms);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bookingLookup, currentUser?._id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !currentUser?._id || bookings.length === 0) {
      return undefined;
    }

    const joinBookingRooms = () => {
      bookings.forEach((booking) => {
        const bookingId = String(booking._id);

        if (joinedRoomsRef.current.has(bookingId)) {
          return;
        }

        socket.emit('chat:join', { bookingId }, (response) => {
          if (!response?.error) {
            joinedRoomsRef.current.add(bookingId);
          }
        });
      });
    };

    joinBookingRooms();

    return undefined;
  }, [bookings, currentUser?._id]);

  const clearUnreadForBooking = (bookingId) => {
    const key = String(bookingId);

    setUnreadCounts((previousCounts) => {
      if (!previousCounts[key]) {
        return previousCounts;
      }

      const nextCounts = { ...previousCounts };
      delete nextCounts[key];
      if (currentUser?._id) {
        localStorage.setItem(getUnreadStorageKey(currentUser._id), JSON.stringify(nextCounts));
      }
      return nextCounts;
    });
  };

  const dismissNotification = () => setNotification(null);

  return {
    unreadCounts,
    notification,
    clearUnreadForBooking,
    dismissNotification,
  };
}