import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatAPI } from '../services/api';

const Chat = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [pendingToolCall, setPendingToolCall] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  // Check server status
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch('/api/chat/history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setServerStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        console.error('Server check failed:', error);
        setServerStatus('offline');
      }
    };
    checkServer();
  }, []);

  // Fetch history on mount
  useEffect(() => {
    console.log('🚀 Chat component mounted, fetching history...');
    fetchHistory();
    hasFetchedRef.current = true;
  }, []);

  // Re-fetch when the pathname changes (navigating back to chat)
  // But only if we've already fetched once and it's been at least 1 second
  useEffect(() => {
    if (hasFetchedRef.current && location.pathname === '/chat') {
      const now = Date.now();
      if (now - lastFetchTimeRef.current > 1000) {
        console.log('🔄 Pathname changed to /chat, refreshing history...');
        fetchHistory();
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      lastFetchTimeRef.current = Date.now();
      const response = await chatAPI.getHistory();
      // API returns { success: true, data: [...messages] }
      // Axios wraps it in response.data, so we get response.data.data
      const messagesData = response.data?.data || [];
      setMessages(messagesData);
      console.log('✅ Chat history loaded:', messagesData.length, 'messages');
    } catch (error) {
      console.error('❌ Error fetching chat history:', error);
      // Don't show error to user on initial load, just log it
      if (messages.length === 0) {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMessage = input.trim();
    setInput('');
    
    console.log('📤 Sending message:', userMessage);
    
    // Add user message immediately
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      _id: Date.now().toString(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    setStreaming(true);
    
    // Create placeholder for assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      _id: assistantMessageId,
    }]);

    try {
      let fullResponse = '';
      let toolCallDetected = false;
      
      // Build conversation history (last 10 messages for context)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      console.log('📚 Conversation history:', conversationHistory.length, 'messages');
      
      await chatAPI.streamChat(
        userMessage,
        conversationHistory,
        (token) => {
          fullResponse += token;
          setMessages(prev => 
            prev.map(msg => 
              msg._id === assistantMessageId 
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        },
        (toolCall) => {
          // Tool call detected
          console.log('🔧 Tool call received:', toolCall);
          toolCallDetected = true;
          setPendingToolCall(toolCall);
          
          // Add tool call message
          const toolCallMsg = `🔔 Whiskers wants to ${toolCall.function.name.replace('_', ' ')}:\n\n${JSON.stringify(toolCall.function.arguments, null, 2)}`;
          setMessages(prev => [...prev, {
            role: 'system',
            content: toolCallMsg,
            _id: (Date.now() + 2).toString(),
            isToolCall: true,
          }]);
        }
      );

      console.log('✅ Stream completed. Response length:', fullResponse.length);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `❌ Error: ${error.message || 'Failed to connect to Whiskers. Please check if the server is running.'}`,
        _id: (Date.now() + 3).toString(),
      }]);
    } finally {
      setStreaming(false);
    }
  };

  const handleConfirmTool = async (approved) => {
    if (!pendingToolCall) return;

    try {
      setLoading(true);
      const response = await chatAPI.confirmToolCall({
        toolCallId: pendingToolCall.id,
        approved,
      });

      // API returns { success: true, message: "...", data: {...} }
      // Axios wraps it in response.data
      const resultMessage = response.data?.message || 'Action completed';
      
      // Add result message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: resultMessage,
        _id: Date.now().toString(),
      }]);

      setPendingToolCall(null);
      
      // Refresh history to get the saved message from DB
      await fetchHistory();
    } catch (error) {
      console.error('Error confirming tool call:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `❌ Failed to execute action: ${error.message}`,
        _id: Date.now().toString(),
      }]);
      setPendingToolCall(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history?')) return;

    try {
      await chatAPI.clearHistory();
      setMessages([]);
      setPendingToolCall(null);
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Failed to clear history');
    }
  };

  const testConnection = async () => {
    console.log('🧪 Testing connection...');
    try {
      const response = await fetch('/api/chat/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('✅ Connection test response:', response.status);
      const data = await response.json();
      console.log('✅ Data:', data);
      alert(`Server is responding! Status: ${response.status}\nMessages: ${data.data?.length || 0}`);
      setServerStatus('online');
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      alert(`Server is NOT responding!\nError: ${error.message}`);
      setServerStatus('offline');
    }
  };

  const copyToClipboard = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
      } catch (err) {
        alert('❌ Failed to copy content');
      }
      document.body.removeChild(textArea);
    }
  };

  const startEditMessage = (messageId, currentContent) => {
    setEditingMessageId(messageId);
    setEditedContent(currentContent);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditedContent('');
  };

  const saveEditedMessage = async () => {
    if (!editedContent.trim()) {
      alert('Message cannot be empty');
      return;
    }

    try {
      // Update the message locally
      setMessages(prev => 
        prev.map(msg => 
          msg._id === editingMessageId 
            ? { ...msg, content: editedContent.trim() }
            : msg
        )
      );
      
      setEditingMessageId(null);
      setEditedContent('');
      
      // Note: In a full implementation, you'd also update the backend
      // For now, we're just updating locally
      alert('✅ Message updated (local only)');
    } catch (error) {
      console.error('Error editing message:', error);
      alert('❌ Failed to edit message');
    }
  };

  const handleEditKeyPress = (e) => {
    if (e.key === 'Escape') {
      cancelEdit();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      saveEditedMessage();
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
        <p className="text-gray-600 dark:text-gray-400 animate-pulse-soft">Loading chat history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)] relative">
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/30 to-blue-50/30 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-blue-900/10 -z-10 rounded-lg"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-3 sm:gap-0 animate-slideInRight">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <span className="animate-float">🐱</span>
            <span>Chat with Whiskers</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Your AI assistant for tasks and notes
            </p>
            {serverStatus === 'offline' && (
              <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full animate-pulse">
                ⚠️ Offline
              </span>
            )}
            {serverStatus === 'online' && (
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                ✓ Connected
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={testConnection}
            className="btn-secondary text-xs sm:text-sm px-3 py-2 transform hover:scale-105 active:scale-95 transition-transform flex-1 sm:flex-none"
            title="Test server connection"
          >
            🔧 Test
          </button>
          <button
            onClick={handleClearHistory}
            className="btn-secondary text-xs sm:text-sm px-3 py-2 transform hover:scale-105 active:scale-95 transition-transform flex-1 sm:flex-none"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 card space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 animate-fadeIn">
            <div className="text-6xl mb-4 animate-float">😺</div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              Meow! Ask me anything or tell me to create tasks/notes!
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-500">
              <div className="inline-block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                💡 Try: "Create a task to buy groceries"
              </div>
              <br />
              <div className="inline-block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                💡 Or: "Make a note about my project ideas"
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={message._id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideInBottom`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 shadow-md hover:shadow-lg transition-all text-sm sm:text-base ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : message.isToolCall
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                      : message.role === 'system'
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                {message.role === 'assistant' && !editingMessageId && (
                  <div className="text-xs font-bold mb-1">🐱 Whiskers:</div>
                )}
                
                {editingMessageId === message._id ? (
                  // Edit Mode
                  <div className="space-y-2">
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      onKeyDown={handleEditKeyPress}
                      className="w-full min-h-[100px] p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      autoFocus
                      placeholder="Edit your message..."
                    />
                    <div className="flex gap-2 justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Ctrl+Enter to save • Esc to cancel
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEditedMessage}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    
                    {/* Action Buttons */}
                    {message.content && (
                      <div className="flex gap-2 mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
                        <button
                          onClick={() => copyToClipboard(message.content, message._id)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            message.role === 'user'
                              ? 'bg-primary-700 hover:bg-primary-800 text-white'
                              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                          }`}
                          title="Copy content"
                        >
                          {copiedMessageId === message._id ? '✓ Copied!' : '📋 Copy'}
                        </button>
                        
                        {message.role !== 'system' && !message.isToolCall && (
                          <button
                            onClick={() => startEditMessage(message._id, message.content)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              message.role === 'user'
                                ? 'bg-primary-700 hover:bg-primary-800 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                            }`}
                            title="Edit message"
                          >
                            ✏️ Edit
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          
          {streaming && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">🐱 Whiskers is typing</div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Tool Confirmation */}
      {pendingToolCall && (
        <div className="mb-4 card bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400">
          <p className="font-medium mb-3">⚠️ Whiskers needs your permission:</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleConfirmTool(true)}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => handleConfirmTool(false)}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
            >
              ❌ Deny
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 animate-slideInBottom">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="💬 Type your message..."
          disabled={streaming}
          className="input-field flex-1 text-sm sm:text-base transition-all duration-200 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="btn-primary px-4 sm:px-6 lg:px-8 text-sm sm:text-base disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
        >
          {streaming ? (
            <span className="flex items-center gap-1 sm:gap-2">
              <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="hidden sm:inline">Sending...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="hidden sm:inline">Send</span>
              <span>🚀</span>
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default Chat;
