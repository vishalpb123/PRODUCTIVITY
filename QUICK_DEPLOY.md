# 🚀 Quick Deployment Reference

## ⚡ 5-Minute Deploy (Render - Recommended)

### 1️⃣ Push to GitHub (2 min)
```bash
cd d:\f\PROJECT
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/productivity-dashboard.git
git push -u origin main
```

### 2️⃣ Deploy Backend (2 min)
1. Go to https://render.com → Sign up with GitHub
2. **New+ → Web Service** → Connect repository
3. Configure:
   - **Name:** `productivity-api`
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add Environment Variables (click Advanced):
   ```
   MONGO_URI = (your MongoDB Atlas URI)
   JWT_SECRET = (generate random string)
   NODE_ENV = production
   CLIENT_URL = (will update after frontend)
   OPENAI_API_KEY = sk-or-v1-...
   OPENAI_MODEL = openai/gpt-3.5-turbo
   PORT = 5000
   ```
5. **Create Web Service** → Copy URL

### 3️⃣ Deploy Frontend (1 min)
1. **New+ → Static Site** → Same repository
2. Configure:
   - **Name:** `productivity-dashboard`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. **Create Static Site** → Copy URL

### 4️⃣ Update Backend URL
1. Go to backend service → **Environment**
2. Update: `CLIENT_URL = (your frontend URL)`
3. Save → Auto-redeploys

### 5️⃣ Update Frontend API
Update `client/src/services/api.js`:
```javascript
const API_URL = 'https://your-backend-url.onrender.com/api';
```

Commit and push:
```bash
git add .
git commit -m "Update API URL"
git push
```

## ✅ Done! Your app is live!

---

## 🌐 Your Live URLs

- **Frontend:** `https://productivity-dashboard.onrender.com`
- **Backend API:** `https://productivity-api.onrender.com`
- **Health Check:** `https://productivity-api.onrender.com/health`

---

## 🔄 Update Your Deployed App

```bash
# Make changes locally
# Test locally
# Then:
git add .
git commit -m "Your update message"
git push
# Render auto-deploys!
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS Error | Update `CLIENT_URL` in backend env vars |
| 401 Unauthorized | Clear cookies, login again |
| Chat not working | Check OpenRouter key has credits |
| Build failed | Check logs on Render dashboard |
| MongoDB error | Whitelist 0.0.0.0/0 in Atlas |

---

## 💰 Free Tier Limits

**Render Free:**
- ✅ Unlimited static sites
- ✅ 750 hours/month web services
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ Cold start: 30-60 seconds

**MongoDB Atlas Free:**
- ✅ 512 MB storage
- ✅ Shared cluster
- ✅ Sufficient for personal use

**OpenRouter:**
- Pay per use
- ~$0.002 per 1K tokens
- $5 credit ≈ 2500 conversations

---

## 📱 Share Your App!

Send these links:
- **Live App:** `https://productivity-dashboard.onrender.com`
- **GitHub:** `https://github.com/YOUR_USERNAME/productivity-dashboard`

---

## 🎓 Alternative Platforms

### Vercel (Frontend)
```bash
npm i -g vercel
cd client
vercel
```

### Netlify (Frontend)
```bash
npm i -g netlify-cli
cd client
npm run build
netlify deploy --prod --dir=dist
```

### Railway (Full-Stack)
1. Go to railway.app
2. New Project → Deploy from GitHub
3. Add service for server folder
4. Add service for client folder
5. Configure environment variables

---

## 🔐 Security Checklist

Before deploying:
- [ ] Change `JWT_SECRET` to random string
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Set `NODE_ENV=production`
- [ ] Review CORS settings
- [ ] Test all features locally first

---

**Need detailed help?** See `DEPLOYMENT_GUIDE.md`

**Last Updated:** November 14, 2025
