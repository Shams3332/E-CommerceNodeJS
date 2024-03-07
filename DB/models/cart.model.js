import mongoose, { Types } from "mongoose";


const cartSchema = new mongoose.Schema({
cart:[{
    product:{
        type:Types.ObjectId,
        ref:"Product"
        },
    price:{
        type:Number,
        ref:"Product"
        },
    count:{
        type:Number,
        default: 1,
    }
    }],
orderBy:{
    type:Types.ObjectId,
    ref: "User",
    
}, 
totalPrice:{
    type:Number,
    default: 0
        },
priceAfterDiscount:{
    type:Number,
    default: 0
}
    
},{timestamps:true});

const cartModel =  mongoose.model('Cart', cartSchema);

export default cartModel;

