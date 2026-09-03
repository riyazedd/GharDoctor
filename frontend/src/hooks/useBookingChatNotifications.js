import { useEffect, useMemo, useRef, useState } from 'react';
import { createChatSocket } from '../services/socket';

const getUnreadStorageKey = (userId) => `ghardoctor_chat_unread_${userId}`;
const getNotificationStorageKey = (userId) => `ghardoctor_chat_notifications_${userId}`;

export default function useBookingChatNotifications({ bookings = [], currentUser, activeBookingId }) {
  const [unreadCounts, setUnreadCounts] = useState({});
  const [statusUnreadCount, setStatusUnreadCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);
  const joinedRoomsRef = useRef(new Set());
  const notificationTimerRef = useRef(null);
  const activeBookingIdRef = useRef(activeBookingId);
  const skipNextNotificationSaveRef = useRef(false);

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
      setStatusUnreadCount(0);
      setNotifications([]);
      return undefined;
    }

    // Do not overwrite stored notifications with the initial empty state before they load.
    skipNextNotificationSaveRef.current = true;

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

    const storedNotifications = localStorage.getItem(getNotificationStorageKey(currentUser._id));
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch {
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
  }, [currentUser?._id]);

  useEffect(() => {
    if (currentUser?._id) {
      if (skipNextNotificationSaveRef.current) {
        skipNextNotificationSaveRef.current = false;
        return;
      }
      localStorage.setItem(getNotificationStorageKey(currentUser._id), JSON.stringify(notifications));
    }
  }, [currentUser?._id, notifications]);

  useEffect(() => {
    if (!currentUser?._id) {
      return undefined;
    }

    const socket = createChatSocket();
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
      const nextNotification = {
        id: message._id || `${bookingId}-${message.createdAt || Date.now()}`,
        bookingId,
        title: booking?.serviceName || 'New message',
        message: `${message.senderName}: ${message.message}`,
        createdAt: message.createdAt || new Date().toISOString(),
      };

      setNotification(nextNotification);
      setNotifications((previousNotifications) => [
        nextNotification,
        ...previousNotifications.filter((item) => item.id !== nextNotification.id),
      ].slice(0, 20));

      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }

      notificationTimerRef.current = setTimeout(() => {
        setNotification(null);
      }, 4500);
    };

    const handleBookingStatus = (update) => {
      if (String(update.updatedById) === String(currentUser._id)) {
        return;
      }

      const bookingId = String(update.bookingId);
      const booking = bookingLookup[bookingId];
      const nextNotification = {
        id: `status-${bookingId}-${update.status}-${update.updatedAt || Date.now()}`,
        bookingId,
        type: 'booking-status',
        title: booking?.serviceName || 'Booking update',
        message: update.message || `Your booking is now ${update.status}.`,
        createdAt: update.updatedAt || new Date().toISOString(),
      };

      setStatusUnreadCount((previousCount) => previousCount + 1);
      setNotification(nextNotification);
      setNotifications((previousNotifications) => [
        nextNotification,
        ...previousNotifications.filter((item) => item.id !== nextNotification.id),
      ].slice(0, 20));

      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
      notificationTimerRef.current = setTimeout(() => setNotification(null), 4500);
    };

    socket.on('chat:message', handleIncomingMessage);
    socket.on('booking:status', handleBookingStatus);
    socket.on('connect', joinBookingRooms);
    socket.on('connect_error', () => {
      // Keep the UI usable if the socket cannot connect; messages will resume on reconnect.
    });

    socket.connect();

    if (socket.connected) {
      joinBookingRooms();
    }

    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
      socket.off('chat:message', handleIncomingMessage);
      socket.off('booking:status', handleBookingStatus);
      socket.off('connect', joinBookingRooms);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bookings, bookingLookup, currentUser?._id]);

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

  const clearAllUnread = () => {
    setUnreadCounts({});
    setStatusUnreadCount(0);
    if (currentUser?._id) {
      localStorage.removeItem(getUnreadStorageKey(currentUser._id));
    }
  };

  const dismissNotification = () => setNotification(null);
  const unreadTotal = Object.values(unreadCounts).reduce((total, count) => total + Number(count || 0), 0) + statusUnreadCount;

  return {
    unreadCounts,
    unreadTotal,
    notification,
    notifications,
    clearUnreadForBooking,
    clearAllUnread,
    dismissNotification,
  };
}
