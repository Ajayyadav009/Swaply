import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    activeRoom: null,       // Current open chat room
    activePeer: null,       // User we're chatting with
    messages: [],           // Messages in active room
    conversations: [],      // All conversation previews
    onlineUsers: [],        // Currently online user IDs
    typing: false,          // Is the other person typing?
  },
  reducers: {
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload.roomId;
      state.activePeer = action.payload.peer;
      state.messages = [];  // Clear messages when switching rooms
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setTyping: (state, action) => {
      state.typing = action.payload;
    },
    clearChat: (state) => {
      state.activeRoom = null;
      state.activePeer = null;
      state.messages = [];
    }
  }
});

export const {
  setActiveRoom,
  setMessages,
  addMessage,
  setConversations,
  setOnlineUsers,
  setTyping,
  clearChat
} = chatSlice.actions;

export default chatSlice.reducer;