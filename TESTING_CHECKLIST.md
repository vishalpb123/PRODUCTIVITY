# ✅ Pre-Deployment Testing Checklist

## 🔐 Authentication
- [ ] Register new user
- [ ] Login with correct credentials
- [ ] Login with wrong credentials (should fail)
- [ ] Logout
- [ ] Token persists on page refresh

---

## ✅ Tasks Management
- [ ] **Create Task:**
  - [ ] With title and description
  - [ ] With title only (description optional)
  - [ ] Set status to "Not Started"
  - [ ] Set status to "In Progress"
  - [ ] Set status to "Completed"

- [ ] **View Tasks:**
  - [ ] See all tasks
  - [ ] Filter by "Not Started"
  - [ ] Filter by "In Progress"
  - [ ] Filter by "Completed"

- [ ] **Update Task:**
  - [ ] Edit title
  - [ ] Edit description
  - [ ] Change status
  - [ ] Save changes

- [ ] **Delete Task:**
  - [ ] Delete confirmation dialog appears
  - [ ] Task deleted from list
  - [ ] Task removed from database

---

## 📝 Notes Management
- [ ] **Create Note:**
  - [ ] With title and content
  - [ ] Long content (test scrolling)
  - [ ] Special characters in content

- [ ] **View Notes:**
  - [ ] See all notes
  - [ ] Search notes by title/content
  - [ ] Clear search

- [ ] **Update Note:**
  - [ ] Edit title
  - [ ] Edit content
  - [ ] Character counter updates
  - [ ] Save changes

- [ ] **Delete Note:**
  - [ ] Delete confirmation dialog appears
  - [ ] Note deleted from list
  - [ ] Note removed from database

---

## 🤖 AI Chatbot (Whiskers)
- [ ] **Basic Chat:**
  - [ ] Send simple message
  - [ ] Receive response
  - [ ] Response appears with streaming effect
  - [ ] Chat history persists

- [ ] **Task Creation via Chat:**
  - [ ] Say: "Create a task for algorithm assignment"
  - [ ] Task automatically created (no confirmation)
  - [ ] Task appears in Tasks page
  - [ ] Bot confirms with success message

- [ ] **Note Creation via Chat:**
  - [ ] Say: "Make a note about software engineering"
  - [ ] Note automatically created with generated content
  - [ ] Note appears in Notes page
  - [ ] Bot confirms with success message

- [ ] **Chat Management:**
  - [ ] Clear chat history
  - [ ] Confirmation dialog appears
  - [ ] History cleared successfully
  - [ ] Success message displayed

---

## 📊 Dashboard
- [ ] **Stats Display:**
  - [ ] Total tasks count correct
  - [ ] Completed tasks count correct
  - [ ] In Progress tasks count correct
  - [ ] Notes count correct

- [ ] **Progress Bar:**
  - [ ] Percentage calculated correctly
  - [ ] Bar fills proportionally
  - [ ] Updates when tasks change status

- [ ] **Time-based Greeting:**
  - [ ] Shows "Good Morning" (5 AM - 11:59 AM)
  - [ ] Shows "Good Afternoon" (12 PM - 4:59 PM)
  - [ ] Shows "Good Evening" (5 PM - 8:59 PM)
  - [ ] Shows "Good Night" (9 PM - 4:59 AM)

- [ ] **Quick Actions:**
  - [ ] Navigate to Tasks
  - [ ] Navigate to Notes
  - [ ] Navigate to Chat

---

## 🎨 UI/UX Features
- [ ] **Theme Toggle:**
  - [ ] Switch to dark mode
  - [ ] Switch to light mode
  - [ ] Preference persists on refresh

- [ ] **Password Strength (Register):**
  - [ ] Indicator shows red for weak
  - [ ] Shows yellow for medium
  - [ ] Shows green for strong
  - [ ] All 5 requirements checked

- [ ] **Animations:**
  - [ ] Cards slide in on page load
  - [ ] Buttons have hover effects
  - [ ] Smooth transitions

---

## 📱 Responsive Design
- [ ] **Mobile View (< 768px):**
  - [ ] Hamburger menu appears
  - [ ] Bottom tab navigation works
  - [ ] Forms are usable
  - [ ] Modals fit screen
  - [ ] Text is readable

- [ ] **Tablet View (768px - 1024px):**
  - [ ] Layout adapts
  - [ ] Grid columns adjust
  - [ ] Navigation visible

- [ ] **Desktop View (> 1024px):**
  - [ ] Full navigation bar
  - [ ] Multi-column layouts
  - [ ] Optimal spacing

---

## 🔒 Security
- [ ] **Protected Routes:**
  - [ ] Cannot access Dashboard without login
  - [ ] Cannot access Tasks without login
  - [ ] Cannot access Notes without login
  - [ ] Cannot access Chat without login
  - [ ] Redirects to login page

- [ ] **JWT Token:**
  - [ ] Stored in localStorage
  - [ ] Sent with API requests
  - [ ] Cleared on logout

---

## 🌐 API Endpoints
Test with browser DevTools Network tab:

- [ ] `POST /api/auth/register` - 201 Created
- [ ] `POST /api/auth/login` - 200 OK
- [ ] `GET /api/tasks` - 200 OK (with token)
- [ ] `POST /api/tasks` - 201 Created
- [ ] `PUT /api/tasks/:id` - 200 OK
- [ ] `DELETE /api/tasks/:id` - 200 OK
- [ ] `GET /api/notes` - 200 OK
- [ ] `POST /api/notes` - 201 Created
- [ ] `PUT /api/notes/:id` - 200 OK
- [ ] `DELETE /api/notes/:id` - 200 OK
- [ ] `POST /api/chat/stream` - 200 OK (SSE)
- [ ] `GET /api/chat/history` - 200 OK
- [ ] `DELETE /api/chat/history` - 200 OK

---

## ⚡ Performance
- [ ] **Load Times:**
  - [ ] Dashboard loads < 2s
  - [ ] Tasks page loads < 2s
  - [ ] Notes page loads < 2s
  - [ ] Chat responds < 5s

- [ ] **Database:**
  - [ ] MongoDB connection stable
  - [ ] No connection errors in console

---

## 🐛 Error Handling
- [ ] **Network Errors:**
  - [ ] Shows error message when server offline
  - [ ] Shows error message on API failure

- [ ] **Form Validation:**
  - [ ] Empty task title prevented
  - [ ] Empty note title prevented
  - [ ] Password requirements enforced

- [ ] **Chat Errors:**
  - [ ] Shows error if OpenAI API fails
  - [ ] Shows error if stream interrupted

---

## 📋 Final Checks Before Deployment
- [ ] All console errors fixed
- [ ] No console warnings
- [ ] All features tested in Chrome
- [ ] All features tested in Firefox
- [ ] All features tested in Edge
- [ ] Mobile tested (or responsive emulation)
- [ ] Dark mode works everywhere
- [ ] Logo displays correctly
- [ ] Favicon shows in browser tab

---

## 🚀 Deployment Readiness
- [ ] `.env` file NOT committed to Git
- [ ] All secrets in environment variables
- [ ] MongoDB Atlas IP whitelist set to 0.0.0.0/0
- [ ] OpenRouter API key has credits
- [ ] JWT_SECRET is strong and unique
- [ ] NODE_ENV set to production in deployment
- [ ] CORS configured for production domain
- [ ] All dependencies in package.json
- [ ] No dev dependencies in production

---

## ✅ Test Results

**Date:** _____________
**Tester:** _____________

**Overall Status:** 
- [ ] All tests passed - Ready to deploy! 🚀
- [ ] Some issues found - See notes below

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

**Last Updated:** November 17, 2025
