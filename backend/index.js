
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/webhooks', webhookRoutes);


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
