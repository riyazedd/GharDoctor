import express from "express"
import users from "./data/users.js"
import dotenv from 'dotenv';
dotenv.config();
import connectDB from "./config/db.js";

const port = 3000;

connectDB();

const app =express();

app.get('/',(req,res)=>{
    res.send("API is running...")
})

app.get('/api/users',(req,res)=>{
    res.json(users);
})

app.listen(port,()=>console.log(`Server running on port ${port}`));