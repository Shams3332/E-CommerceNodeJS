import mongoose, { Types } from "mongoose";

const orderSchema = new mongoose.Schema({
    products:[{
        product:{
            type:Types.ObjectId,
            ref:"Product"
            },
        count:{
            type:Number
        }
    }],
    paymentIntent:{},
    orderStatus:{
        type:String,
        default:"Not processed",
        enum:[
            "Not processed",
            "Cash on Delivery",
            "Processing",
            "DisPatched",
            "Cancelled",
            "Delivered",
        ]
    },
    orderBy:{
        type:Types.ObjectId,
        ref: "User",
        
    }
},{timestamps:true})


const orderModel =  mongoose.model('Order', orderSchema);

export default orderModel;
