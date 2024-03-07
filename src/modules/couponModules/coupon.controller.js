import couponModel from '../../../DB/models/coupon.model.js';
import { SUCCESS ,FAIL,ERROR } from './../../utils/httpStatusText.js';


const createCoupon = async(req,res) => {

    try{
        if (!req.user.id) {
            return res.status(401).json({ status: FAIL, data: { message: "You do not have permission to create Coupon" } });
        }
        const newCoupon = new couponModel({
            couponCode: req.body.couponCode,
            couponValue: req.body.couponValue,
            expireIn: req.body.expireIn,
            createdBy:req.user.id
        });

        await newCoupon.save();
        res.status(201).json({ status: SUCCESS, data: { message: "Coupon Add successfully", newCoupon } });

    }catch(error){
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }

}

const getAllCoupons= async(req,res) => {

    try {

        const coupons = await couponModel.find();
        res.status(201).json({ status: SUCCESS, data: { message: "ALL Coupons", coupons } });
        
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
    
}

const updateCoupon= async(req,res)=>  {

    try {
        const couponId = req.params.couponId;
        const {  couponCode, couponValue, expireIn } = req.body;

        const coupon = await couponModel.findById(couponId);

        if (!coupon) {
            return res.status(404).json({ status: FAIL, data: { message: 'coupon not found' } });
        }

        // Check if the logged-in user is the owner of the product or admin
        if (coupon.createdBy.toString() !== req.user.id || req.user.role !== "admin") {
            return res.status(403).json({ status: FAIL, data: { message: 'You do not have permission to update this coupon' } });
        }

        // Update the coupon
        const updateCoupon = await couponModel.findOneAndUpdate(
            { _id: couponId, createdBy: req.user.id },
            {
                $set: {
                    couponCode,
                    couponValue,
                    expireIn,
                    updatedBy: req.user.id,
                },
            },
            { new: true }
        );

        if (!updateCoupon) {
            return res.status(404).json({ status: FAIL, data: { message: 'coupon not found' } });
        }

        res.status(200).json({ status: SUCCESS, data: { updateCoupon} });
    } catch (error) {

        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }

}

// delete coupon
const deletedCoupon = async (req, res) => {
    try {
        const couponId = req.params.couponId;
        const coupon = await couponModel.findById(couponId);

        if (!coupon) {
            return res.status(404).json({ status: FAIL, data: { message: 'Coupon not found' } });
        }

         // Check if the logged-in user is the owner of the product or admin
        if (coupon.createdBy.toString() !== req.user.id || req.user.role !== "admin") {
            return res.status(403).json({ status: FAIL, data: { message: 'You do not have permission to update this coupon' } });
        }

        // Use findOneAndUpdate to update the deletedBy field without actually deleting the coupon
        const deletedCoupon = await couponModel.findOneAndUpdate(
            { _id: couponId },
            { $set: { deletedBy: req.user.id } },
            { new: true }
        );

        res.status(200).json({ status: SUCCESS, data: deletedCoupon, message: 'Coupon marked as deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};



export {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deletedCoupon
}