
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from 'http';
import mongoose from "mongoose";
import cors from "cors";
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import newsletterRoutes from './routes/newsletter.js';
import webhookRoutes from './routes/webhooks.js';
import path from 'path';
import { fileURLToPath } from 'url';



const app = express();
app.use(cors());
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
// Webhooks (keep before JSON body consumers if using raw body verification)
app.use('/api/webhooks', webhookRoutes);

// Static serving of frontend in production (disabled for development)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const frontendDist = path.resolve(__dirname, '../frontend/dist');
// app.use(express.static(frontendDist));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(frontendDist, 'index.html'));
// });

const PORT = process.env.PORT || 5000;

// Create HTTP server so we can attach WebSocket server to the same server
const server = http.createServer(app);

// Attach WebSocket server (lazy - if ws package is available)
try {
  import('./websocket.js').then(({ attachWebsocket }) => {
    const { broadcast } = attachWebsocket(server, { path: '/ws' });
    // expose broadcast for route handlers to use
    app.locals.broadcast = broadcast;
    console.log('WebSocket server attached at /ws');
  }).catch((err) => {
    console.warn('WebSocket module not available or failed to initialize:', err?.message || err);
  });
} catch (err) {
  console.warn('WebSocket attach skipped:', err?.message || err);
}

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
