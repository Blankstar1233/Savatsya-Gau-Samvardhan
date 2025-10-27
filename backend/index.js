
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import express from "express";
import http from 'http';
import mongoose from "mongoose";
import cors from "cors";
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import newsletterRoutes from './routes/newsletter.js';
import path from 'path';
import { fileURLToPath } from 'url';



const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://savatsya-gau-samvardhan.vercel.app',
  'https://savatsya-gau-samvardhan-git-main-blankstar1233s-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin?.includes('vercel.app'))) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI in backend/.env. Please set it to your MongoDB connection string.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Static serving of frontend in production (disabled for development)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const frontendDist = path.resolve(__dirname, '../frontend/dist');
// app.use(express.static(frontendDist));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(frontendDist, 'index.html'));
// });

const PORT = process.env.PORT || 5000;


const server = http.createServer(app);


try {
  import('./websocket.js').then(({ attachWebsocket }) => {
    const { broadcast } = attachWebsocket(server, { path: '/ws' });
   
    app.locals.broadcast = broadcast;
    console.log('WebSocket server attached at /ws');
  }).catch((err) => {
    console.warn('WebSocket module not available or failed to initialize:', err?.message || err);
  });
} catch (err) {
  console.warn('WebSocket attach skipped:', err?.message || err);
}

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
