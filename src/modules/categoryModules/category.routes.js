import { Router } from "express";
import { createCategory, image ,updateCategory , getAllCategory, deleteCategory ,specificCategory} from "./category.controller.js";
import {auth, authAdmin} from './../../middleware/auth.js';
import { validation } from './../../middleware/validation.js';
import { categoryIdValidation, categoryValidationSchema, updateCategorySchema } from "./category.validation.js";


const categoryRouter = Router();


categoryRouter.get('/',getAllCategory);

categoryRouter.post('/',image ,authAdmin,validation(categoryValidationSchema),createCategory);

categoryRouter.patch('/:categoryId',image ,authAdmin,validation(updateCategorySchema),updateCategory);

categoryRouter.delete('/:categoryId',authAdmin,validation(categoryIdValidation),deleteCategory);

categoryRouter.get('/specificCategory/:categoryId',validation(categoryIdValidation),specificCategory);


export default categoryRouter;