import axios from 'axios';

// Use relative URL to leverage Vite proxy
const API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Tasks API
export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Notes API
export const notesAPI = {
  getAll: () => api.get('/notes'),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

// Chat API
export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  confirmToolCall: (data) => api.post('/chat/confirm', data),
  getHistory: () => api.get('/chat/history'),
  clearHistory: () => {
    console.log('🗑️ Clearing chat history...');
    return api.delete('/chat/history');
  },
  
  // SSE Streaming method
  streamChat: async (message, conversationHistory = [], onToken, onToolCall) => {
    const token = localStorage.getItem('token');
    
    console.log('🚀 Starting chat stream for message:', message);
    console.log('🔑 Auth token present:', !!token);
    console.log('📚 Conversation history:', conversationHistory.length, 'messages');
    
    try {
      const response = await fetch(`/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          message,
          conversationHistory 
        }),
      });

      console.log('📡 Stream response status:', response.status);
      console.log('📡 Stream response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Stream request failed:', response.status, errorText);
        throw new Error(`Stream request failed: ${response.status} - ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      console.log('✅ Stream reader created, reading data...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('✅ Stream completed');
          break;
        }

        const chunk = decoder.decode(value);
        console.log('📥 Received chunk:', chunk.substring(0, 100), '...');
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('📦 Received SSE data:', data.type);
              
              if (data.type === 'start') {
                console.log('🎬 Stream started:', data.message);
              } else if (data.type === 'token' && onToken) {
                onToken(data.content);
              } else if (data.type === 'tool_executed') {
                console.log('✅ Tool executed automatically:', data.result);
                // Tool was executed automatically, show result
                if (onToken) {
                  onToken(`\n\n✅ ${data.result.message}\n`);
                }
              } else if (data.type === 'tool_call' && onToolCall) {
                console.log('🔧 Tool call detected:', data.toolCall);
                onToolCall(data.toolCall);
              } else if (data.type === 'done') {
                console.log('✅ Stream done', data.executionResult ? 'with execution result' : '');
                // If there's an execution result, append it to the message
                if (data.executionResult && onToken) {
                  const resultEmoji = data.executionResult.success ? '✅' : '❌';
                  onToken(`\n\n${resultEmoji} ${data.executionResult.message}`);
                }
              } else if (data.type === 'error') {
                console.error('❌ Server error:', data.message);
                throw new Error(data.message);
              }
            } catch (e) {
              console.error('❌ Error parsing SSE data:', e, 'Line:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Stream error:', error);
      throw error;
    }
  },
};

export default api;
