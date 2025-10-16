# Quick Start Deployment - TLDR Version

Follow these exact steps in order:

## 1️⃣ Deploy Backend First

### Go to Railway.app
```
1. Visit https://railway.app
2. Sign up with GitHub
3. Create new project → "Deploy from GitHub repo"
4. Select your repository
5. Set Root directory to: backend
6. Add these Environment Variables:
   - MONGO_URI=mongodb+srv://2023vedjoshi_:VertexFalcon@userandall.6pzpu9z.mongodb.net/?retryWrites=true&w=majority&appName=Userandall
   - JWT_SECRET=424eb53cae8a6f447daff23f1493116e85a52ccb93a35699a87976a4f0df8567949e87976a4f0df8567
   - CLOUDINARY_CLOUD_NAME=dsfwyovxr
   - CLOUDINARY_API_KEY=983834196338784
   - CLOUDINARY_API_SECRET=tTA8r1tWAirMcBqNXZU8ciuXeoM
7. Click Deploy
8. ⏳ Wait 2-5 minutes
9. Copy the URL (like https://backend-xxx.railway.app)
```

## 2️⃣ Update Frontend Code

Edit `frontend/.env`:
```env
VITE_API_URL=https://your-railway-url.railway.app
```

Then update all API calls in your code:
- Search for `localhost:5000` in frontend files
- Replace with `${process.env.VITE_API_URL}`

## 3️⃣ Deploy Frontend to Vercel

```
1. Visit https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Select your repository
5. Settings:
   - Root Directory: frontend
   - Framework: Vite
   - Build Command: npm run build
   - Output: dist
6. Add Environment Variables:
   - VITE_API_URL=https://your-railway-url.railway.app
7. Click "Deploy"
8. ⏳ Wait 3-5 minutes
9. Your site is LIVE! ✅
```

## ✅ Test It Works

1. Open your Vercel URL
2. Try to login
3. Check DevTools (F12) → Network tab
4. You should see API calls going to Railway URL
5. Everything should work!

## 🆘 If Something Breaks

### Backend not responding
- Check Railway logs: Project → Logs
- Verify all env vars are set
- Check MongoDB is running

### Frontend shows blank page
- Check Vercel logs: Deployments → View Logs
- Check browser console: F12 → Console

### API calls failing
- Make sure VITE_API_URL matches your Railway URL exactly
- Check browser Network tab to see what URL it's calling
- Add CORS if needed (see VERCEL_DEPLOYMENT.md)

## 📞 Need More Help?

See `VERCEL_DEPLOYMENT.md` for detailed troubleshooting!