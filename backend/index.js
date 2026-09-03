import express from "express"
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();
import connectDB from "./config/db.js";
import { initSocket } from './socket.js';

import userRoutes from './routes/userRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import serviceProviderRoutes from './routes/serviceProviderRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import chatbotRoutes from './routes/chatbot.route.js'
import { getCurrentSession } from './controller/sessionController.js';


const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.join(__dirname, 'uploads');

connectDB();

const app =express();
const server = createServer(app);
const io = initSocket(server);
app.set('io', io);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get('/uploads/:filename', (req, res, next) => {
  // Identity documents are never public, including legacy files from before
  // private storage was introduced.
  if (req.params.filename.startsWith('citizenshipImage-')) {
    return res.status(404).json({ message: 'File not found' });
  }
  return res.sendFile(path.basename(req.params.filename), { root: uploadDirectory }, (error) => {
    if (error && !res.headersSent) next();
  });
});

app.get('/',(req,res)=>{
    res.send("API is running...")
})
app.get('/api/session', getCurrentSession);

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-providers', serviceProviderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Keep API failures predictable and avoid returning stack traces to clients.
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid resource ID' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'A record with this value already exists' });
  const status = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
});

server.listen(port,()=>console.log(`Server running on port ${port}`));
