import express from "express"
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import users from "./data/users.js"
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
initSocket(server);

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
app.use('/uploads', express.static(uploadDirectory));

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

server.listen(port,()=>console.log(`Server running on port ${port}`));
