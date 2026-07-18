import mongoose  from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const uri= process.env.ATLAS_URI || ""
const connectDB = async (retries = 5, delay = 3000) => {
    try{
     const conn= await mongoose.connect(uri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        conn.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
    }
    catch(error){
        console.error("Error connecting to MongoDB:", error);
       process.exit(1); 
    }
}

export default connectDB;