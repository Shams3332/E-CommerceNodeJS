import slugify from 'slugify';
import { SUCCESS, FAIL, ERROR } from '../../utils/httpStatusText.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import productModel from './../../../DB/models/product.model.js';
import categoryModel from '../../../DB/models/category.model.js';

// Middleware setup

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/upload');
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + '_' + file.originalname);
    },
});
const upload = multer({ storage: storage });
export const image = upload.single('productImage');

// Add product in product
const addProduct = async (req, res) => {
    try {
        if (req.user.id !== req.body.createdBy) {
            return res.status(401).json({ status: FAIL, data: { message: 'You do not have permission to add product' } });
        }
        const productPrice = parseFloat(req.body.productPrice || 0);

        const discount = parseFloat(req.body.discount || 0);

        // Calculate the price after discount
        const priceAfterDiscount = discount ? productPrice - (productPrice * (discount / 100)) : productPrice;

        // Check if the category exists
        const existingCategory = await categoryModel.findById(req.body.category);

        if (!existingCategory) {
            return res.status(404).json({ status: FAIL, data: { message: 'Category not found' } });
        }
        
        if (!req.file) {
            return res.status(400).json({ status: ERROR, message: 'Image must be provided' });
        }

        // Create a new product and save it
        const product = new productModel({
            productName: req.body.productName,
            productPrice:req.body.productPrice,
            discount: discount,
            priceAfterDiscount: priceAfterDiscount,
            productImage:"http://localhost:5000/upload/" + req.file.filename,
            category: req.body.category,
            createdBy: req.body.createdBy,
        });

        await product.save();

        res.status(201).json({ status: SUCCESS, data: { message: 'Product added successfully', product } });
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

// update product
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { productName, productImage, discount, productPrice } = req.body;

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ status: FAIL, data: { message: 'Product not found' } });
        }

        // Check if the logged-in user is the owner of the product or admin
        if (product.createdBy.toString() !== req.user.id || req.user.role !== "admin") {
            return res.status(403).json({ status: FAIL, data: { message: 'You do not have permission to update this product' } });
        }

        // Ensure productPrice is a valid number
        const newProductPrice = typeof productPrice === 'number' ? productPrice : product.productPrice;

        // Ensure discount is a valid number
        const newDiscount = typeof discount === 'number' ? discount : product.discount;

        // Check if both productPrice and discount are valid numbers
        if (typeof newProductPrice !== 'number' || typeof newDiscount !== 'number') {
            return res.status(400).json({ status: FAIL, data: { message: 'Invalid values for productPrice or discount' } });
        }

        // Calculate the price after discount
        const newPriceAfterDiscount = newProductPrice - (newProductPrice * (newDiscount / 100));

        // Update the product
        const updateProduct = await productModel.findOneAndUpdate(
            { _id: productId, createdBy: req.user.id },
            {
                $set: {
                    productName,
                    productImage,
                    discount: newDiscount,
                    productPrice: newProductPrice,
                    priceAfterDiscount: newPriceAfterDiscount,
                },
            },
            { new: true }
        );

        if (!updateProduct) {
            return res.status(404).json({ status: FAIL, data: { message: 'Product not found' } });
        }

        res.status(200).json({ status: SUCCESS, data: { updateProduct } });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

// delete product
const deleteProduct = async (req, res) => {
    const productId = req.params.productId;
    const product = await productModel.findById(productId);

    if (!product) {
        return res.status(404).json({ status: FAIL, data: { message: 'Product not found' } });
    }

    if (product.createdBy.toString() !== req.user.id || req.user.role !== 'admin') {
        return res.status(403).json({ status: FAIL, data: { message: 'You do not have permission to delete this product' } });
    }

    // Use findOneAndDelete with a query object
    const deletedProduct = await productModel.findOneAndDelete({ _id: productId });

    if (!deletedProduct) {
        return res.status(404).json({ status: FAIL, data: { message: 'Product not found' } });
    }

    res.status(200).json({ status: SUCCESS, data: null });
};

// Get all product with paginate

const getAllProduct = async (req, res) => {
    try {
        const query = req.query;
        console.log("query" , query);

        const limit = query.limit || 5 ;

        const page =query.page || 1;

        const skip =(page -1 ) * limit;

        const allProduct = await productModel.find({},{"__v" :false}).limit(limit).skip(skip);
        res.status(200).json({ status: SUCCESS, data: { allProduct } });
    }
    catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

// Get specific product
const specificProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ status: FAIL, data: { message: 'product not found' } });
        }

        res.status(200).json({ status: SUCCESS, data: product });
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

// Get all products that are in the same category
const getCategoryWithProducts = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        // Find the category by its ID
        const category = await categoryModel.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: FAIL, data: { message: 'Category not found' } });
        }

        // Find all products in the given category and populate the "category" field
        const allCategoryProducts = await productModel.find({ category: categoryId }).populate("category");

        res.status(200).json({ status: SUCCESS, data: { allCategoryProducts } });
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};


export { 
    addProduct,
    updateProduct,
    deleteProduct,
    getAllProduct,
    specificProduct,
    getCategoryWithProducts
};
