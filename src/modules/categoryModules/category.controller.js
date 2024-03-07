import slugify from 'slugify';
import categoryModel from './../../../DB/models/category.model.js';
import { SUCCESS ,FAIL,ERROR } from './../../utils/httpStatusText.js';
import multer from "multer";
import { v4 as uuidv4 } from 'uuid';

// Middleware setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/upload');
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + "_" + file.originalname);
    }
});
const upload = multer({ storage: storage });
export const image = upload.single('categoryImage');

// Create category
const createCategory = async (req, res) => {
    try {
        if (req.user.id !== req.body.createdBy) {
            return res.status(401).json({ status: FAIL, data: { message: "You do not have permission to create category" } });
        }

        if (!req.file) {
            return res.status(400).json({ status: ERROR, message: 'Image must be provided' });
        }
        const { categoryName } = req.body;
        const newCategory = new categoryModel({
            createdBy:req.body.createdBy,
            categoryName,
            categoryImage:"http://localhost:5000/upload/" + req.file.filename,
        });

        await newCategory.save();

        res.status(201).json({ status: SUCCESS, data: { message: "category created successfully", newCategory } });
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const { categoryName, categoryImage } = req.body;

        const category = await categoryModel.findById(categoryId);


        console.log('category:', category);

        if (!category) {
            return res.status(404).json({ status: 'FAIL', data: { message: 'Category not found' } });
        }

        // Check if the logged-in user is the owner of the category or admin
        if (category.createdBy.toString() !== req.user.id || req.user.role !=="admin") {
            return res.status(403).json({ status: 'FAIL', data: { message: 'You do not have permission to update this category' } });
        }

        // Update the category
        const updateCategory = await categoryModel.findOneAndUpdate(
            { _id: categoryId, createdBy: req.user.id },
            { $set: { categoryName, categoryImage } }, 
            { new: true }
        );

        if (!updateCategory) {
            return res.status(404).json({ status: 'FAIL', data: { message: 'Category not found' } });
        }

        res.status(200).json({ status: SUCCESS, data: { updateCategory } });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ status: 'ERROR', message: error.message, data: null });
    }
};

// get all category
const getAllCategory = async (req, res) => {
    try {
        const allCategories = await categoryModel.find();
        res.status(200).json({ status: SUCCESS, data: { allCategories } });
    }
    catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

// specific category
const specificCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await categoryModel.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: FAIL, data: { message: 'Category not found' } });
        }

        res.status(200).json({ status: SUCCESS, data: category });
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

// delete category
const deleteCategory=async(req,res) => {

        const categoryId = req.params.categoryId;
        const category = await categoryModel.findById(categoryId);


        if (!category) {
            return res.status(404).json({ status: FAIL, data: { message: 'Category not found' } });
        }
        if (category.createdBy.toString() !== req.user.id || req.user.role !=="admin") {
            return res.status(403).json({ status: FAIL, data: { message: 'You do not have permission to delete this category' } });
        }

        const deleteCategory = await categoryModel.findOneAndDelete(categoryId);
        res.status(200).json({ status:SUCCESS, data: null });

}



export {
    createCategory,
    updateCategory,
    getAllCategory,
    deleteCategory,
    specificCategory
};

