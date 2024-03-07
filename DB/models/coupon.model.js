import mongoose, { Types } from "mongoose";

const couponSchema = new mongoose.Schema({
    couponCode:{
        type:String
    },
    couponValue:{
        type:Number
    },
    expireIn:{
        type:Date
    },
    createdBy:{
        type:Types.ObjectId,
        ref:"User"
    },
    updatedBy:{
        type:Types.ObjectId,
        ref:"User"
    },
    deletedBy:{
        type:Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

const couponModel =  mongoose.model('Coupon', couponSchema);

export default couponModel;