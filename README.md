# 🚀 Personal Productivity Dashboard

A full-stack productivity application with AI-powered chat assistant, task management, and note-taking capabilities.

## 🌟 Features

### Backend
- ✅ **User Authentication** - JWT-based secure authentication
- 📋 **Task Management** - Create, read, update, delete tasks with status tracking
- 📝 **Note Management** - Full CRUD operations for notes
- 🤖 **AI Chat Assistant (Whiskers)** - OpenAI-powered chatbot with personality
- 🔄 **SSE Streaming** - Real-time token-by-token AI responses
- 🛠️ **Function Calling** - AI can create tasks/notes with user confirmation
- 🔒 **Advanced Security**:
  - Rate limiting (DOS protection)
  - IP tracking and auto-blocking after failed attempts
  - XSS and NoSQL injection prevention
  - Input validation and sanitization
  - CSRF protection
  - Helmet security headers

### Frontend
- ⚛️ **React 18** with Vite for fast development
- 🎨 **Tailwind CSS** - Modern, responsive UI with dark mode
- 🔐 **Protected Routes** - Authentication-based navigation
- 📊 **Dashboard** - Real-time statistics and quick actions
- 💬 **Chat Interface** - SSE streaming with Whiskers the AI cat
- 🎯 **Task & Note Pages** - Full CRUD interfaces with modals

## 🛠️ Tech Stack

**Backend:**
- Node.js 18+
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- OpenAI API
- Helmet, Rate Limiting, Validation

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Context API

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key

### 1. Clone and Setup Backend

```powershell
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
# Copy the content from server/.env and update:
# - MONGO_URI with your MongoDB connection string
# - JWT_SECRET with a secure random string
# - OPENAI_API_KEY with your OpenAI API key

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Setup Frontend

```powershell
# Open new terminal and navigate to client directory
cd client

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🚀 Usage

### 1. Register/Login
- Navigate to `http://localhost:3000`
- Create an account or login
- You'll be redirected to the dashboard

### 2. Dashboard
- View statistics for tasks and notes
- Quick access to all features

### 3. Tasks
- Create tasks with title, description, and status
- Filter by status (Not Started, In Progress, Completed)
- Edit and delete tasks
- Tasks are user-specific

### 4. Notes
- Create detailed notes
- Search through notes by title or content
- Edit and delete notes
- View creation/update dates

### 5. Chat with Whiskers 🐱
- AI assistant powered by OpenAI GPT-3.5-turbo
- Type messages and get streaming responses
- Ask Whiskers to create tasks/notes:
  - "Create a task to buy groceries"
  - "Make a note about my meeting tomorrow"
- Approve/deny AI actions before execution
- View chat history

## 🔐 Security Features

### Rate Limiting
- **API Routes:** 100 requests per 15 minutes per IP
- **Authentication:** 5 attempts per 15 minutes
- **Login Slowdown:** Progressive delays after failed attempts

### IP Blocking
- Automatic 1-hour block after 10 failed login attempts
- Tracked in MongoDB with expiration

### Input Validation
- Email format validation
- Password strength requirements (8+ chars, uppercase, lowercase, number, special char)
- XSS prevention with escaping
- NoSQL injection prevention

### Data Protection
- Password hashing with bcrypt (10 rounds)
- JWT tokens with expiration
- HTTP-only secure headers
- CORS configuration

## 📁 Project Structure

```
PROJECT/
├── server/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Task.js            # Task schema
│   │   ├── Note.js            # Note schema
│   │   └── ChatMessage.js     # Chat history schema
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   ├── taskController.js  # Task CRUD
│   │   ├── noteController.js  # Note CRUD
│   │   └── chatController.js  # AI chat with SSE
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth/*
│   │   ├── taskRoutes.js      # /api/tasks/*
│   │   ├── noteRoutes.js      # /api/notes/*
│   │   └── chatRoutes.js      # /api/chat/*
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification
│   │   ├── security.js        # Rate limiting, IP blocking
│   │   └── validation.js      # Input validation
│   ├── server.js              # Main server file
│   ├── package.json
│   └── .env                   # Environment variables
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx          # Navigation shell
    │   │   └── ProtectedRoute.jsx  # Route guard
    │   ├── context/
    │   │   ├── AuthContext.jsx     # Auth state management
    │   │   └── ThemeContext.jsx    # Dark mode
    │   ├── pages/
    │   │   ├── Login.jsx           # Login page
    │   │   ├── Register.jsx        # Registration page
    │   │   ├── Dashboard.jsx       # Dashboard with stats
    │   │   ├── Tasks.jsx           # Task management
    │   │   ├── Notes.jsx           # Note management
    │   │   └── Chat.jsx            # AI chat interface
    │   ├── services/
    │   │   └── api.js              # Axios API layer
    │   ├── App.jsx                 # Main app with routing
    │   ├── main.jsx                # Entry point
    │   └── index.css               # Tailwind styles
    ├── vite.config.js              # Vite config with proxy
    ├── tailwind.config.js
    └── package.json
```

## 🤖 AI Chat Features

### Whiskers Personality
- Friendly cat-themed assistant
- Uses cat emojis 🐱
- Helpful and playful tone

### Available AI Functions
1. **create_task** - Create new tasks
2. **create_note** - Create new notes
3. **get_tasks** - Retrieve user's tasks
4. **get_notes** - Retrieve user's notes

### Function Calling Workflow
1. User asks AI to perform an action
2. AI decides which function to use
3. User receives confirmation request
4. User approves/denies
5. Action is executed (if approved)
6. Confirmation message displayed

### Example Prompts
- "Create a task to finish the report by Friday"
- "Show me all my tasks"
- "Make a note about the project meeting"
- "What tasks do I have?"

## 🌙 Dark Mode

Toggle dark mode using the button in the navigation bar. Preference is saved to localStorage.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Tasks (Protected)
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Notes (Protected)
- `GET /api/notes` - Get all user notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Chat (Protected)
- `POST /api/chat/message` - Send message (non-streaming)
- `POST /api/chat/stream` - Send message (SSE streaming)
- `POST /api/chat/confirm` - Confirm/deny tool call
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/history` - Clear chat history

## 🔧 Environment Variables

**server/.env:**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_change_this
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
```

## 🎯 Future Enhancements

- [ ] Task due dates and reminders
- [ ] Categories/tags for tasks and notes
- [ ] Rich text editor for notes
- [ ] File attachments
- [ ] Collaboration features
- [ ] Email notifications
- [ ] Mobile app
- [ ] Voice input for chat
- [ ] More AI functions (search, summarize, etc.)

## 📄 License

MIT

## 👨‍💻 Developer

Built with ❤️ using Node.js, React, and OpenAI

---

**Need help?** Check the console logs for detailed error messages or review the security documentation in `server/SECURITY_ANALYSIS.md`.
