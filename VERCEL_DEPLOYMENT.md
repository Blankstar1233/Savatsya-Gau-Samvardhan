# Vercel Deployment Guide - Step by Step

## ⚠️ IMPORTANT: Before Deploying

Your backend is currently configured for local development with WebSocket support. Vercel has **limitations**:
- ❌ No persistent WebSocket support on serverless
- ✅ REST API works perfectly
- ✅ Real-time updates can use polling or external services

### Solution: Deploy Backend Separately
For production, deploy your backend to a service that supports WebSockets like:
- **Railway** (recommended, free tier available)
- **Render.com**
- **Heroku** (paid)
- **AWS/DigitalOcean**

---

## Step 1: Prepare Your Project

### 1.1 Commit All Changes
```bash
cd v:\All_projects\Savatsya-Gau-Samvardhan
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 1.2 Verify .env Files Are Correct

**Backend (.env)** - Already has:
- ✅ MONGO_URI
- ✅ JWT_SECRET
- ✅ CLOUDINARY credentials

**Frontend (.env)** - Should have:
```
Mongo_URI=mongodb+srv://2023vedjoshi_:VertexFalcon@userandall.6pzpu9z.mongodb.net/?retryWrites=true&w=majority&appName=Userandall
```

---

## Step 2: Deploy Backend (Choose One Method)

### Option A: Deploy to Railway (Recommended)

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Create new project** → Select "Deploy from GitHub repo"
4. **Select your repository**
5. **Configure:**
   - Root directory: `backend`
   - Add variables (Environment tab):
     - `MONGO_URI=mongodb+srv://2023vedjoshi_:VertexFalcon@userandall.6pzpu9z.mongodb.net/?retryWrites=true&w=majority&appName=Userandall`
     - `JWT_SECRET=424eb53cae8a6f447daff23f1493116e85a52ccb93a35699a87976a4f0df8567949e87976a4f0df8567`
     - `CLOUDINARY_CLOUD_NAME=dsfwyovxr`
     - `CLOUDINARY_API_KEY=983834196338784`
     - `CLOUDINARY_API_SECRET=tTA8r1tWAirMcBqNXZU8ciuXeoM`
     - `PORT=5000`
6. **Deploy** → Railway will auto-deploy and give you a URL like `https://project-name.up.railway.app`
7. **Save the Railway URL** - You'll need this for frontend

### Option B: Deploy to Render.com

1. **Go to [render.com](https://render.com)**
2. **Sign up/Login**
3. **Create New** → **Web Service**
4. **Connect GitHub repository**
5. **Configuration:**
   - Name: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add all environment variables from `.env`
6. **Deploy**
7. **Save the Render URL** - You'll get something like `https://backend-name.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Update Frontend .env with Backend URL

Edit `frontend/.env`:
```
# Replace with your backend URL from Step 2
VITE_API_URL=https://your-backend-url.railway.app
```

### 3.2 Create `frontend/vite.config.ts` Proxy (if needed)

If the above doesn't work, update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

### 3.3 Go to [vercel.com](https://vercel.com)

1. **Sign in with GitHub**
2. **Click "New Project"**
3. **Select your GitHub repository**
4. **Configure Import Settings:**
   - Root Directory: `frontend`
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 3.4 Add Environment Variables in Vercel

In Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add for **Production, Preview, Development**:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   Mongo_URI=mongodb+srv://2023vedjoshi_:VertexFalcon@userandall.6pzpu9z.mongodb.net/?retryWrites=true&w=majority&appName=Userandall
   ```

### 3.5 Deploy

1. Click **"Deploy"**
2. Wait 3-5 minutes for build to complete
3. You'll get a URL like `https://project-name.vercel.app`

---

## Step 4: Update Frontend to Use Backend URL

### 4.1 Update API Calls

In your frontend files (e.g., `AuthContext.tsx`, components), update API URLs:

**Before:**
```typescript
const response = await fetch('http://localhost:5000/api/auth/login', {
```

**After:**
```typescript
const backendUrl = process.env.VITE_API_URL || 'http://localhost:5000';
const response = await fetch(`${backendUrl}/api/auth/login`, {
```

### 4.2 Check Frontend Socket Configuration

In `frontend/src/lib/socket.ts`, ensure it handles the backend URL:
```typescript
export function createSocket(url?: string) {
  const wsUrl = url || `ws${window.location.protocol === 'https:' ? 's' : ''}://${window.location.host}/ws`;
  // For production, use: 
  // const wsUrl = `wss://your-backend-url.railway.app/ws`;
  
  // ... rest of code
}
```

---

## Step 5: Verify Deployment

### Test Your Frontend
1. Visit your Vercel URL: `https://project-name.vercel.app`
2. Test features:
   - ✅ Login/Register
   - ✅ View Products
   - ✅ Add to Cart
   - ✅ Upload Profile Picture (uses Cloudinary)
   - ✅ Change Theme
   - ✅ Delete Account

### Test Backend Connectivity
1. Open browser DevTools (F12) → Network tab
2. Try to login
3. Check that API calls go to your backend URL
4. Look for status `200` responses

### Check Logs
- **Vercel**: Dashboard → Deployments → View Logs
- **Railway/Render**: Dashboard → View Logs

---

## Common Issues & Solutions

### ❌ "Cannot find module" or Build Fails

**Solution**: Ensure `package-lock.json` is removed:
```bash
cd frontend
rm package-lock.json
rm -r node_modules
npm install
npm run build
```

### ❌ "CORS Error" or "Cannot connect to API"

**Solution 1**: Add CORS in backend `index.js`:
```javascript
app.use(cors({
  origin: ['https://your-vercel-url.vercel.app', 'http://localhost:5174'],
  credentials: true
}));
```

**Solution 2**: Add environment variable in Vercel:
```
FRONTEND_URL=https://your-vercel-url.vercel.app
```

### ❌ "MongoDB connection fails"

**Solution**: Your `MONGO_URI` is correct. Ensure:
1. MongoDB Atlas allows connections from Vercel IPs (add `0.0.0.0/0` to Network Access)
2. Username/password are URL-encoded correctly

### ❌ "Image upload fails"

**Solution**: Cloudinary credentials are correct. Check:
1. `CLOUDINARY_CLOUD_NAME`, `API_KEY`, `API_SECRET` are set in Vercel
2. Cloudinary account is active

### ❌ "Theme/Animation doesn't work"

**Solution**: Ensure localStorage works in production:
```typescript
// In ThemeContext
const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
```

---

## Step 6: Custom Domain (Optional)

1. In Vercel: **Settings** → **Domains**
2. Add your domain
3. Update DNS records (Vercel will show instructions)
4. Update backend CORS to include your domain

---

## Full Environment Variables Checklist

### Vercel Dashboard Variables (Frontend)
- [ ] `VITE_API_URL` = Your backend URL
- [ ] `Mongo_URI` = Your MongoDB connection

### Railway/Render Variables (Backend)
- [ ] `MONGO_URI` = Your MongoDB connection
- [ ] `JWT_SECRET` = 64+ character hex string
- [ ] `CLOUDINARY_CLOUD_NAME` = `dsfwyovxr`
- [ ] `CLOUDINARY_API_KEY` = `983834196338784`
- [ ] `CLOUDINARY_API_SECRET` = `tTA8r1tWAirMcBqNXZU8ciuXeoM`
- [ ] `PORT` = `5000` (or whatever Railway assigns)

---

## ✅ Success Checklist

- [ ] Backend deployed to Railway/Render/Heroku
- [ ] Backend URL copied
- [ ] Frontend updated with backend URL
- [ ] Environment variables set in Vercel
- [ ] Vercel deployment triggered
- [ ] Frontend loads without errors
- [ ] Can login/register
- [ ] Can upload images
- [ ] Can browse products
- [ ] Can place orders
- [ ] Can delete account

---

## Support

If you encounter issues:
1. Check Vercel logs: Dashboard → Deployments → Recent deployment → Logs
2. Check Railway/Render logs: Project → Logs
3. Check browser console: F12 → Console tab
4. Check Network tab: F12 → Network → Check failed requests