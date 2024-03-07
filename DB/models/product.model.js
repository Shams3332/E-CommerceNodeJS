import mongoose, { Types } from "mongoose"

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        lowercase: true,
    },
    productPrice: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    priceAfterDiscount: {
        type: Number,
        default: 0,
    },
    productImage: {
        type: String,
        required: true,
    },
    category: {
        type:Types.ObjectId,
        ref: 'Category',
        required: [true, 'Product must belong to a category'],
    },
    stock: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type:Types.ObjectId,
        ref: "User",
    }
},{timestamps:true});

const productModel =  mongoose.model('Product', productSchema);

export default productModel;
