import mongoose from "mongoose";
import dotenv from 'dotenv';
import connectDb from './config/db.js';
// import products from "./data/product.js";
import users from "./data/users.js";
import services from "./data/services.js";
import serviceProviders from "./data/serviceProviders.js";
import categories from "./data/categories.js";
// import Product from "./models/productModel.js";
import User from "./models/userModel.js";
import Service from "./models/serviceModel.js";
import ServiceProvider from "./models/serviceProviderModel.js";
import Category from "./models/categoryModel.js";

dotenv.config();

connectDb();

const importData= async ()=>{
    try{
        // await Product.deleteMany();
        await User.deleteMany();
        await Service.deleteMany();
        await ServiceProvider.deleteMany();

        const createdUser = await User.insertMany(users);

        const adminUser = createdUser[0]._id;

        const sampleService= services.map((service)=>{
            return {...service}
        })
        const sampleCategory= categories.map((category)=>{
            return {...category}
        })

        const createdServiceProvider = await ServiceProvider.insertMany(serviceProviders)

        await Service.insertMany(sampleService);
        await Category.insertMany(sampleCategory);
        
        console.log("Data Imported!!!");
        process.exit();

    }catch(error){
        console.error(`${error}`);
        process.exit(1);
    }
}

const destroyData = async ()=>{
    try{
        // await Product.deleteMany();
        await User.deleteMany();
        await Service.deleteMany();

        console.log("Data Destroyed!!!");
        process.exit();
    }catch(error){
        console.error(`${error}`);
        process.exit(1);
    }
}

if(process.argv[2]==='-d'){
    destroyData();
}else{
    importData();
}