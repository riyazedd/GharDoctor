import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { createChatSocket } from '../services/socket';

export default function ChatBox({ isOpen, booking, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const bookingRoomTitle = useMemo(() => {
    if (!booking || !currentUser) {
      return 'Chat';
    }

    const isProvider = String(currentUser._id) === String(booking.serviceProviderId);
    return isProvider ? booking.userName : booking.providerName;
  }, [booking, currentUser]);

  useEffect(() => {
    if (!isOpen || !booking || !currentUser) {
      return undefined;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in again to use chat.');
      return undefined;
    }

    setMessages([]);
    setDraft('');
    setError('');
    setLoadingHistory(true);

    const socket = createChatSocket(token);
    socketRef.current = socket;

    socket.on('connect_error', () => {
      setError('Unable to connect to the chat server.');
      setLoadingHistory(false);
    });

    socket.on('chat:message', (message) => {
      setMessages((previousMessages) => [...previousMessages, message]);
    });

    socket.connect();

    socket.on('connect', () => {
      socket.emit('chat:join', { bookingId: booking._id }, (response) => {
        if (response?.error) {
          setError(response.error);
          setLoadingHistory(false);
          return;
        }

        setMessages(response?.messages || []);
        setLoadingHistory(false);
      });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isOpen, booking, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (event) => {
    event.preventDefault();

    const socket = socketRef.current;
    if (!socket || !booking) {
      return;
    }

    const trimmedMessage = draft.trim();
    if (!trimmedMessage) {
      return;
    }

    setSending(true);
    setError('');

    socket.emit('chat:message', { bookingId: booking._id, message: trimmedMessage }, (response) => {
      setSending(false);

      if (response?.error) {
        setError(response.error);
        return;
      }

      setDraft('');
    });
  };

  if (!isOpen || !booking) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-950/70 backdrop-blur-sm px-3 py-3 md:p-6">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl shadow-cyan-500/10 flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4 bg-slate-900/80">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-[0.24em]">Booking Chat</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100">{booking.serviceName}</h3>
            <p className="text-sm text-slate-400">Conversation with {bookingRoomTitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-950">
          {loadingHistory ? (
            <div className="flex h-64 items-center justify-center text-slate-400">
              Loading conversation...
            </div>
          ) : messages.length > 0 ? (
            messages.map((message) => {
              const isMine = String(message.senderId) === String(currentUser?._id);

              return (
                <div key={message._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 border ${
                    isMine
                      ? 'bg-cyan-500/15 border-cyan-500/25 text-slate-100'
                      : 'bg-slate-900/80 border-slate-800 text-slate-100'
                  }`}>
                    <div className="flex items-center justify-between gap-4 mb-1 text-xs">
                      <span className="font-semibold text-cyan-400">{isMine ? 'You' : message.senderName}</span>
                      <span className="text-slate-500">{new Date(message.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-64 items-center justify-center text-center text-slate-400 px-6">
              <div>
                <p className="font-semibold text-slate-200 mb-1">No messages yet</p>
                <p className="text-sm">Start the conversation about this booking.</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-800 bg-slate-900/80 p-4">
          {error && (
            <div className="mb-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write a message..."
              rows={2}
              className="min-h-13 flex-1 resize-none rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/50"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="inline-flex h-13 items-center gap-2 rounded-2xl bg-cyan-500 px-5 font-bold text-slate-950 transition-all hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}