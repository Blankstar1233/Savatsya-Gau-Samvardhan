
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import newsletterRoutes from './routes/newsletter.js';
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

// Static serving of frontend in production (disabled for development)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const frontendDist = path.resolve(__dirname, '../frontend/dist');
// app.use(express.static(frontendDist));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(frontendDist, 'index.html'));
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
