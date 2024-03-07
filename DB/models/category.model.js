import mongoose, { Types } from "mongoose"

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
    },
    categoryImage: {
        type: String,
    },
    createdBy: {
        type:Types.ObjectId,
        ref: "User",
    },
    slug: {
        type: String,
        lowercase: true,
    },
}, { timestamps: true });

const categoryModel = mongoose.model("Category" ,categorySchema);

export default categoryModel;
