import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const connection_instance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected successfully ! \nDB host: ${connection_instance.connection.host}`);
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
}

export default connectDB;