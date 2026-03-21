import mongoose from 'mongoose';
 
const connectDB = async() =>{
    try{
        const mongoDB_URI = process.env.MONGODB_URL?.replace(/\/$/, "");
        const connectionInstance = await mongoose.connect(`${mongoDB_URI}/${process.env.DB_NAME}`);
        // console.log(`Database connected successfully, ${connectionInstance.connection.host}`)
        return connectionInstance;  
    }

    catch(error){
        console.log(`Database connection failed ${error}`)
        process.exit(1);
    }
}

export default connectDB; 