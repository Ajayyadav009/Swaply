import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  setActiveRoom, setMessages,
  addMessage, setTyping
} from '../store/slices/chatSlice';
import api from '../services/api';
import socket from '../socket/socket';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Chat = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { messages, typing } = useSelector((state) => state.chat);

  const [text, setText] = useState('');
  const [peer, setPeer] = useState(location.state?.peer || null);
  const [loadingPeer, setLoadingPeer] = useState(!location.state?.peer);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  // ── Derive peer from roomId if not passed via state ──
  useEffect(() => {
    if (!peer && roomId && user) {
      const ids = roomId.split('_');
      const peerId = ids.find(id => id !== user._id);
      if (peerId) {
        api.get(`/users/${peerId}`)
          .then(({ data }) => setPeer(data))
          .catch(() => { toast.error('Chat not found'); navigate('/'); })
          .finally(() => setLoadingPeer(false));
      }
    }
  }, [roomId, user]);

  // ── Socket setup — runs when peer is ready ──
useEffect(() => {
  if (!peer || !user) return;

  // Connect first
  if (!socket.connected) {
    socket.connect();
  }

  // Wait for connection then setup
  const setupSocket = () => {
    console.log('Socket connected, setting up room...');
    socket.emit('user_online', user._id);
    socket.emit('join_room', roomId);
  };

  if (socket.connected) {
    setupSocket();
  } else {
    socket.on('connect', setupSocket);
  }

  dispatch(setActiveRoom({ roomId, peer }));

  // Load history
  api.get(`/chat/history/${roomId}`)
    .then(({ data }) => dispatch(setMessages(data.messages)))
    .catch(() => toast.error('Failed to load messages'));

  // Message handler
  const onMessage = (message) => {
    console.log('Message received in UI:', message);
    dispatch(addMessage(message));
  };

  const onTyping = () => dispatch(setTyping(true));
  const onStopTyping = () => dispatch(setTyping(false));

  socket.on('receive_message', onMessage);
  socket.on('user_typing', onTyping);
  socket.on('user_stop_typing', onStopTyping);

  return () => {
    socket.off('connect', setupSocket);
    socket.off('receive_message', onMessage);
    socket.off('user_typing', onTyping);
    socket.off('user_stop_typing', onStopTyping);
  };
}, [peer, roomId]);

  // ── Auto scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send Message ──
  const handleSend = () => {
    if (!text.trim() || sending) return;
    setSending(true);
    socket.emit('send_message', {
      roomId,
      senderId: user._id,
      receiverId: peer._id,
      text: text.trim()
    });
    setText('');
    setSending(false);
    clearTimeout(typingTimerRef.current);
    socket.emit('stop_typing', { roomId, userId: user._id });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit('typing', { roomId, userId: user._id });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('stop_typing', { roomId, userId: user._id });
    }, 2000);
  };

  const formatTime = (dateStr) => new Date(dateStr)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  // ── Loading state ──
  if (loadingPeer) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.centered}>
          <p style={{ color: '#64748b' }}>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.chatWindow}>

          {/* Header */}
          <div style={styles.chatHeader}>
            <button style={styles.backBtn} onClick={() => navigate('/')}>
              ← Back
            </button>
            <div style={styles.peerInfo}>
              <div style={styles.peerAvatar}>
                {peer?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={styles.peerName}>{peer?.name}</p>
                <p style={styles.peerStatus}>
                  {typing ? '✏️ typing...' : '● Active now'}
                </p>
              </div>
            </div>
            <div style={styles.peerSkills}>
              {peer?.teaches?.slice(0, 2).map((s, i) => (
                <span key={i} style={styles.peerSkillBadge}>
                  🎓 {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={styles.messagesArea}>
            {messages.length === 0 && (
              <div style={styles.emptyChat}>
                <div style={styles.emptyChatIcon}>💬</div>
                <p style={styles.emptyChatText}>
                  Start the conversation with {peer?.name}!
                </p>
                <p style={styles.emptyChatHint}>
                  Introduce yourself and discuss how you can swap skills.
                </p>
              </div>
            )}

            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div style={styles.dateSeparator}>
                  <span style={styles.dateLabel}>{date}</span>
                </div>
                {msgs.map((msg, index) => {
                  const senderId = msg.sender?._id || msg.sender;
                  const isMe = senderId?.toString() === user._id?.toString();
                  return (
                    <div
                      key={msg._id || index}
                      style={{
                        ...styles.messageRow,
                        justifyContent: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {!isMe && (
                        <div style={styles.msgAvatar}>
                          {peer?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{
                        ...styles.bubble,
                        ...(isMe ? styles.myBubble : styles.theirBubble)
                      }}>
                        <p style={styles.bubbleText}>{msg.text}</p>
                        <p style={{
                          ...styles.bubbleTime,
                          color: isMe ? 'rgba(255,255,255,0.7)' : '#94a3b8'
                        }}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {typing && (
              <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
                <div style={styles.msgAvatar}>
                  {peer?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={styles.typingBubble}>
                  <span style={styles.dot} />
                  <span style={styles.dot} />
                  <span style={styles.dot} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={styles.inputArea}>
            <textarea
              style={styles.input}
              placeholder={`Message ${peer?.name}...`}
              value={text}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              style={text.trim() ? styles.sendBtn : styles.sendBtnDisabled}
              onClick={handleSend}
              disabled={!text.trim() || sending}
            >
              Send ➤
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { background: '#f8fafc', minHeight: '100vh' },
  centered: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', height: '80vh'
  },
  container: { maxWidth: '860px', margin: '0 auto', padding: '24px' },
  chatWindow: {
    background: '#fff', borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column',
    height: 'calc(100vh - 140px)'
  },
  chatHeader: {
    padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', gap: '14px',
    borderRadius: '16px 16px 0 0', background: '#fff'
  },
  backBtn: {
    padding: '7px 14px', borderRadius: '8px',
    border: '1px solid #e2e8f0', background: '#f8fafc',
    color: '#64748b', fontSize: '13px',
    cursor: 'pointer', fontWeight: '500'
  },
  peerInfo: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1 },
  peerAvatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: '700', fontSize: '16px'
  },
  peerName: { fontWeight: '700', color: '#1e293b', fontSize: '15px' },
  peerStatus: { fontSize: '12px', color: '#10b981', marginTop: '1px' },
  peerSkills: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  peerSkillBadge: {
    padding: '4px 10px', borderRadius: '20px',
    background: '#eef2ff', color: '#6366f1',
    fontSize: '12px', fontWeight: '600'
  },
  messagesArea: {
    flex: 1, overflowY: 'auto',
    padding: '20px', display: 'flex',
    flexDirection: 'column', gap: '4px'
  },
  emptyChat: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    flex: 1, padding: '60px 20px', textAlign: 'center'
  },
  emptyChatIcon: { fontSize: '48px', marginBottom: '14px' },
  emptyChatText: {
    fontSize: '16px', fontWeight: '600',
    color: '#1e293b', marginBottom: '6px'
  },
  emptyChatHint: { fontSize: '14px', color: '#94a3b8' },
  dateSeparator: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '16px 0'
  },
  dateLabel: {
    padding: '4px 14px', borderRadius: '20px',
    background: '#f1f5f9', color: '#94a3b8',
    fontSize: '12px', fontWeight: '600'
  },
  messageRow: {
    display: 'flex', alignItems: 'flex-end',
    gap: '8px', marginBottom: '4px'
  },
  msgAvatar: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '11px',
    fontWeight: '700', flexShrink: 0
  },
  bubble: {
    maxWidth: '65%', padding: '10px 14px',
    borderRadius: '16px', wordBreak: 'break-word'
  },
  myBubble: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', borderBottomRightRadius: '4px'
  },
  theirBubble: {
    background: '#f1f5f9', color: '#1e293b',
    borderBottomLeftRadius: '4px'
  },
  bubbleText: { fontSize: '14px', lineHeight: '1.5' },
  bubbleTime: { fontSize: '10px', marginTop: '4px', textAlign: 'right' },
  typingBubble: {
    background: '#f1f5f9', padding: '14px 18px',
    borderRadius: '16px', display: 'flex',
    gap: '4px', alignItems: 'center'
  },
  dot: {
    width: '7px', height: '7px', borderRadius: '50%',
    background: '#94a3b8', display: 'inline-block'
  },
  inputArea: {
    padding: '16px 20px', borderTop: '1px solid #e2e8f0',
    display: 'flex', gap: '12px', alignItems: 'flex-end',
    background: '#fff', borderRadius: '0 0 16px 16px'
  },
  input: {
    flex: 1, padding: '12px 16px', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', fontSize: '14px',
    color: '#1e293b', resize: 'none',
    fontFamily: 'inherit', background: '#f8fafc', lineHeight: '1.5'
  },
  sendBtn: {
    padding: '12px 22px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', whiteSpace: 'nowrap'
  },
  sendBtnDisabled: {
    padding: '12px 22px', borderRadius: '12px', border: 'none',
    background: '#e2e8f0', color: '#94a3b8',
    fontSize: '14px', cursor: 'not-allowed', whiteSpace: 'nowrap'
  }
};

export default Chat;