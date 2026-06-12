import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Search, ArrowLeft } from 'lucide-react';
import { chatAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import { PageHeader, EmptyState } from '../../components/common/index';
import { useSelector } from 'react-redux';
import { formatDistanceToNow, format } from 'date-fns';

export default function ChatPage() {
  const { user } = useSelector(s => s.auth);
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [liveMessages, setLiveMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { data: chats, isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatAPI.getChats().then(r => r.data.data),
  });

  const { data: chatData, isLoading: msgsLoading } = useQuery({
    queryKey: ['chat-messages', selectedChat?._id],
    queryFn: () => chatAPI.getMessages(selectedChat._id).then(r => r.data.data),
    enabled: !!selectedChat?._id,
    onSuccess: (data) => setLiveMessages(data.messages || []),
  });

  // Socket for real-time messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('new_message', ({ chatId, message: msg }) => {
      if (chatId === selectedChat?._id) {
        setLiveMessages(prev => [...prev, msg]);
      }
      queryClient.invalidateQueries(['chats']);
    });

    socket.on('typing', ({ chatId }) => {
      if (chatId === selectedChat?._id) setTyping(true);
    });

    socket.on('stop_typing', ({ chatId }) => {
      if (chatId === selectedChat?._id) setTyping(false);
    });

    return () => {
      socket.off('new_message');
      socket.off('typing');
      socket.off('stop_typing');
    };
  }, [selectedChat]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveMessages]);

  // Sync messages when chatData loads
  useEffect(() => {
    if (chatData?.messages) setLiveMessages(chatData.messages);
  }, [chatData]);

  const sendMutation = useMutation({
    mutationFn: ({ recipientId, content }) => chatAPI.sendMessage({ recipientId, content }),
    onSuccess: (res) => {
      setLiveMessages(prev => [...prev, res.data.data]);
      setMessage('');
      queryClient.invalidateQueries(['chats']);
    },
  });

  const handleSend = () => {
    if (!message.trim() || !selectedChat) return;
    const recipient = selectedChat.participants?.find(p => p._id !== user._id);
    if (!recipient) return;
    sendMutation.mutate({ recipientId: recipient._id, content: message.trim() });
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    const socket = getSocket();
    if (!socket || !selectedChat) return;
    const recipient = selectedChat.participants?.find(p => p._id !== user._id);
    if (!recipient) return;
    socket.emit('typing', { chatId: selectedChat._id, recipientId: recipient._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { chatId: selectedChat._id, recipientId: recipient._id });
    }, 1500);
  };

  const getOtherParticipant = (chat) => chat.participants?.find(p => p._id !== user._id);

  return (
    <div>
      <PageHeader title="Messages" subtitle="Chat with your food providers" />

      <div className="card overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">

          {/* Chat List */}
          <div className={`w-full md:w-80 border-r border-gray-100 dark:border-gray-800 flex flex-col flex-shrink-0 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                <input placeholder="Search chats..." className="input-field pl-9 py-2 text-sm" />
              </div>
            </div>

            {/* Chat items */}
            <div className="flex-1 overflow-y-auto">
              {chatsLoading ? (
                <div className="space-y-2 p-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse p-2">
                      <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-3 w-2/3 rounded" />
                        <div className="skeleton h-3 w-1/2 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : chats?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageCircle size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">Order from a provider to start chatting</p>
                </div>
              ) : (
                chats?.map(chat => {
                  const other = getOtherParticipant(chat);
                  const isSelected = selectedChat?._id === chat._id;
                  return (
                    <motion.button key={chat._id} onClick={() => setSelectedChat(chat)}
                      whileHover={{ backgroundColor: 'rgba(249,115,22,0.05)' }}
                      className={`w-full flex items-center gap-3 p-3 transition-colors ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {other?.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{other?.name}</p>
                          {chat.lastMessageAt && (
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                              {formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: false })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{chat.lastMessage || 'No messages yet'}</p>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {!selectedChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-3xl flex items-center justify-center mb-4">
                  <MessageCircle size={28} className="text-primary-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Select a conversation</h3>
                <p className="text-sm text-gray-400">Choose a chat from the left to start messaging</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <button onClick={() => setSelectedChat(null)} className="md:hidden p-1 text-gray-400 hover:text-gray-600">
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {getOtherParticipant(selectedChat)?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {getOtherParticipant(selectedChat)?.name}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{getOtherParticipant(selectedChat)?.role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {msgsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                    </div>
                  ) : liveMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-sm text-gray-400">No messages yet. Say hi! 👋</p>
                    </div>
                  ) : (
                    liveMessages.map((msg, i) => {
                      const isMine = msg.sender === user._id || msg.sender?._id === user._id;
                      return (
                        <motion.div key={msg._id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? 'bg-primary-500 text-white rounded-br-md'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                          }`}>
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                              {msg.createdAt ? format(new Date(msg.createdAt), 'hh:mm a') : 'now'}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}

                  {/* Typing indicator */}
                  {typing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1">
                        {[0,1,2].map(i => (
                          <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            className="w-2 h-2 bg-gray-400 rounded-full" />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <input
                      value={message}
                      onChange={handleTyping}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Type a message..."
                      className="input-field flex-1 py-2.5 text-sm"
                    />
                    <button onClick={handleSend} disabled={!message.trim() || sendMutation.isPending}
                      className="w-10 h-10 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
