import { Router } from "express";
import { image, addProduct ,updateProduct ,deleteProduct ,getAllProduct ,specificProduct,getCategoryWithProducts} from "./product.controller.js";
import { authAdmin} from '../../middleware/auth.js';
import { validation } from './../../middleware/validation.js';
import { ProductsInCategorySchema, productValidationSchema,productIdSchema, updateProductSchema } from "./product.validation.js";


const productRouter = Router();


productRouter.post('/',image,authAdmin,validation(productValidationSchema),addProduct);

productRouter.get('/',getAllProduct);

productRouter.patch('/:productId',authAdmin,validation(updateProductSchema),updateProduct);

productRouter.get('/:productId',validation(productIdSchema),specificProduct);

productRouter.delete('/:productId',validation(productIdSchema),authAdmin, deleteProduct);

productRouter.get('/allProductsInCategory/:categoryId',validation(ProductsInCategorySchema) ,getCategoryWithProducts);

export default productRouter;