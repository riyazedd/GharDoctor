import express from "express"
import cookieParser from 'cookie-parser';
import cors from 'cors';
import users from "./data/users.js"
import dotenv from 'dotenv';
dotenv.config();
import connectDB from "./config/db.js";

import userRoutes from './routes/userRoutes.js'


const port = 3000;

connectDB();

const app =express();

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

app.get('/',(req,res)=>{
    res.send("API is running...")
})

app.use('/api/users', userRoutes);

app.listen(port,()=>console.log(`Server running on port ${port}`));