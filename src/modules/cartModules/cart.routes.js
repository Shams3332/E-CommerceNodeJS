import { Router } from "express";
import { auth} from '../../middleware/auth.js';
import { userCart ,getUserCart , emptyCart, updateCart, applyCoupon ,createOrder,getOrder, removeItemFromCart, updateCount} from "./cart.controller.js";


const cartRouter = Router();

cartRouter.post('/',auth,userCart);

cartRouter.post('/applyCoupon',auth,applyCoupon)

cartRouter.get('/',auth,getUserCart);

cartRouter.delete('/',auth,emptyCart);

cartRouter.patch('/:cartId/:productIdToUpdate',auth,updateCart)

cartRouter.post('/order',auth,createOrder)

cartRouter.get('/getOrder',auth,getOrder)

cartRouter.delete('/:id',auth,removeItemFromCart);

cartRouter.put('/:id',auth,updateCount);

export default cartRouter;