import mongoose from "mongoose";

const connectDB= async() =>{
    // await mongoose.connect('mongodb://localhost:27017/FinalProject')
    
    await mongoose.connect(`mongodb+srv://e-commerce:${process.env.DATABASEPASSWORD}@cluster0.hhjeuxm.mongodb.net/E-Commerce`)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log('Database connection error', err));

}

export default connectDB;