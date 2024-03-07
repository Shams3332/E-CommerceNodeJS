import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'Please enter a username'],
        trim: true
    },
    email:{
        type:String,
        required:[true, 'please enter your email'],
        trim:true
    },
    password:{
        type:String,
        required:[true , 'please enter your password'],
        trim:true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isVerify: { 
        type:Boolean,
        default:false
    },
    addresses: 
        {
            type: String,
    },
    age:{
        type: Number,
    },
    phone:{
        type:String
    },
    resetCode:{
        type:String,
        default:''
    },
    isActive:{
        type:Boolean,
        default:true
    },
    pendingUpdate: {
        type: {
            field: String, 
            value: String, 
        },
        default: null,
    },
    
});



const userModel =  mongoose.model('User' , userSchema);

export default userModel;
