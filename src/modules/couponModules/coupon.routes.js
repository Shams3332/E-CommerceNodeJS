import { Router } from "express";
import { authAdmin} from '../../middleware/auth.js';
import { createCoupon ,getAllCoupons ,updateCoupon ,deletedCoupon} from "./coupon.controller.js";

const couponRouter=Router();


couponRouter.post("/",authAdmin,createCoupon)

couponRouter.get('/',authAdmin,getAllCoupons)

couponRouter.patch('/:couponId',authAdmin,updateCoupon)

couponRouter.delete('/:couponId',authAdmin,deletedCoupon)

export default couponRouter;