import express from "express"
import cookieParser from 'cookie-parser';
import users from "./data/users.js"
import dotenv from 'dotenv';
dotenv.config();
import connectDB from "./config/db.js";

import userRoutes from './routes/userRoutes.js'


const port = 3000;

connectDB();

const app =express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send("API is running...")
})

app.use('/api/users', userRoutes);

app.listen(port,()=>console.log(`Server running on port ${port}`));