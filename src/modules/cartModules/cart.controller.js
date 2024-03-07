import { SUCCESS ,FAIL,ERROR } from './../../utils/httpStatusText.js';
import cartModel from '../../../DB/models/cart.model.js';
import productModel from '../../../DB/models/product.model.js';
import couponModel from './../../../DB/models/coupon.model.js';
import orderModel from '../../../DB/models/order.model.js';
import uniqid from 'uniqid';

const pricCalc = async (model) => {
    let totalPrice = 0;
    model.cart.forEach((item) => {
        totalPrice += item.count * item.price;
    });
    model.totalPrice = totalPrice;
    await model.save();
};
// routes/cart.js

const userCart = async (req, res) => {
    try {
      if (!req.user.id) {
        return res
          .status(401)
          .json({ status: FAIL, data: { message: "You do not have permission to add to the cart" } });
      }
  
      const { cart } = req.body;
  
      // Check if the user already has a cart
      const existingCart = await cartModel.findOne({ orderBy: req.user.id });
  
      if (existingCart) {
        // If the user already has a cart, update the existing cart
        existingCart.cart = await Promise.all(
          cart.map(async (item) => {
            // Fetch the product from the product model
            const existingProduct = await productModel.findById(item.product);
            if (!existingProduct) {
              return res.status(404).json({ status: FAIL, data: { message: 'Product not found' } });
            }
  
            // Set the cart item details including price
            return {
              product: item.product,
              count: item.count || 1, // Default count to 1 if not provided
              price: existingProduct.priceAfterDiscount || 0, // Use the product's price or default to 0
            };
          })
        );
  
        await existingCart.save();
        pricCalc(existingCart);
  
        return res.status(200).json({ status: SUCCESS, message: "Cart updated successfully", data: { existingCart } });
      }
  
      // If the user doesn't have a cart, create a new one
      const newCart = await cartModel.create({
        cart: await Promise.all(
          cart.map(async (item) => {
            // Fetch the product from the product model
            const existingProduct = await productModel.findById(item.product);
            if (!existingProduct) {
              return res.status(404).json({ status: FAIL, data: { message: 'Product not found' } });
            }
  
            // Set the cart item details including price
            return {
              product: item.product,
              count: item.count || 1, // Default count to 1 if not provided
              price: existingProduct.priceAfterDiscount || 0, // Use the product's price or default to 0
            };
          })
        ),
        orderBy: req.user.id,
      });
  
      pricCalc(newCart);
  
      res.status(200).json({ status: SUCCESS, message: "Cart created successfully", data: { newCart } });
    } catch (error) {
      res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
  };
  
// const userCart = async (req, res) => {
//     try {
//         if (!req.user.id) {
//             return res.status(401).json({ status: FAIL, data: { message: "You do not have permission to add to the cart" } });
//         }

//         const { cart } = req.body;

//         // Check if the user already has a cart
//         const existingCart = await cartModel.findOne({ orderBy: req.user.id });

//         if (existingCart) {
//             // If the user already has a cart, update the existing cart
//             existingCart.cart = await Promise.all(
//                 cart.map(async (item) => {
//                     // Fetch the product from the product model
//                     const existingProduct = await productModel.findById(item.product);
//                     if (!existingProduct) {
//                         return res.status(404).json({ status: FAIL, data: { message: 'Product not found' } });
//                     }

//                     // Set the cart item details including price
//                     return {
//                         product: item.product,
//                         count: item.count || 1, // Default count to 1 if not provided
//                         price: existingProduct.priceAfterDiscount || 0, // Use the product's price or default to 0
//                     };
//                 })
//             );

//             await existingCart.save();
//             pricCalc(existingCart);

//             return res.status(200).json({ status: SUCCESS, message: "Cart updated successfully", data: { existingCart } });
//         }

//         // If the user doesn't have a cart, create a new one
//         const newCart = await cartModel.create({
//             cart: await Promise.all(
//                 cart.map(async (item) => {
//                     // Fetch the product from the product model
//                     const existingProduct = await productModel.findById(item.product);
//                     if (!existingProduct) {
//                         return res.status(404).json({ status: FAIL, data: { message: 'Product not found' } });
//                     }

//                     // Set the cart item details including price
//                     return {
//                         product: item.product,
//                         count: item.count || 1, // Default count to 1 if not provided
//                         price: existingProduct.priceAfterDiscount || 0, // Use the product's price or default to 0
//                     };
//                 })
//             ),
//             orderBy: req.user.id,
//         });

//         pricCalc(newCart);

//         res.status(200).json({ status: SUCCESS, message: "Cart created successfully", data: { newCart } });
//     } catch (error) {
//         res.status(500).json({ status: ERROR, message: error.message, data: null });
//     }
// };


const getUserCart = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ status: FAIL, data: { message: "You do not have permission to get the cart" } });
        }

        // Log existing cart data
        const existingCart = await cartModel.findOne({ orderBy: req.user.id });
    
        // Fetch cart with population
        const cart = await cartModel.findOne({ orderBy: req.user.id }).populate("cart.product");
    
        res.status(200).json({ status: SUCCESS, message: "Get user cart successful", data: cart });
    } catch (error) {
        console.error('Error fetching user cart:', error);
        res.status(500).json({ status: ERROR, message: error.message});
    }
};


const updateCart = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ status: FAIL, data: { message: "You do not have permission to update the Cart" } });
        }
        const cartId = req.params.cartId;
        const productIdToUpdate = req.params.productIdToUpdate;
        const updates = req.body;

        // Check if the cart exists
        const existingCart = await cartModel.findById(cartId);

        if (!existingCart) {
            return res.status(404).json({ status: FAIL, data: { message: 'Cart not found' } });
        }

        // Check if the user has permission to update this cart
        if (existingCart.orderBy.toString() !== req.user.id) {
            return res.status(403).json({ status: FAIL, data: { message: 'You do not have permission to update this cart' } });
        }

        // Find the index of the product to update in the cart
        const productIndex = existingCart.cart.findIndex(product => product.product.toString() === productIdToUpdate);

        if (productIndex === -1) {
            return res.status(404).json({ status: FAIL, data: { message: 'Product not found in the cart' } });
        }

        // Update the count of the specific product
        existingCart.cart[productIndex].count = updates.count;

        // Recalculate the total price and total price after discount in the cart
         existingCart.totalPrice = existingCart.cart.reduce((total, product) => total + (product.price * product.count), 0);
        
        //existingCart.priceAfterDiscount = existingCart.cart.reduce((total, product) => total + (product.priceAfterDiscount * product.count), 0);

        // Save the updated cart
        const updatedCart = await existingCart.save();

        res.status(200).json({ status: SUCCESS, message: "Cart updated successfully", data: updatedCart });
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

const emptyCart = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ status: FAIL, data: { message: "You do not have permission to empty Cart" } });
        }
        const cart = await cartModel.findOneAndDelete({ orderBy: req.user.id });

        res.status(200).json({ status: SUCCESS, message: "Cart emptied successfully", data: cart });
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

const applyCoupon = async (req, res) => {
    try {
        const { coupon } = req.body;

        // Check if the coupon is valid
        const validCoupon = await couponModel.findOne({ couponCode: coupon });

        if (!validCoupon || validCoupon.deletedBy) {
            return res.status(401).json({ status: FAIL, data: { message: "Invalid coupon" } });
        }

        // Find the cart and populate the product details
        const cart = await cartModel.findOne({ orderBy: req.user.id }).populate("cart.product");

        if (!cart) {
            return res.status(404).json({ status: FAIL, data: { message: "Cart not found" } });
        }

        // Calculate the price before discount and after discount
        const totalPriceBeforeDiscount = cart.totalPrice;
        const priceAfterDiscount = (totalPriceBeforeDiscount - (totalPriceBeforeDiscount * validCoupon.couponValue) / 100).toFixed(2);

        // Update the cart with the new priceAfterDiscount
        const updatedCart = await cartModel.findOneAndUpdate(
            { orderBy: req.user.id },
            { priceAfterDiscount },
            { new: true }
        );

        res.status(200).json({
            status: SUCCESS,
            message: "Coupon applied successfully",
            data: {
                totalPriceBeforeDiscount,
                priceAfterDiscount,
                updatedCart
            }
        });
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

const createOrder = async (req, res) => {
    try {

        if (!req.user.id) {
            return res.status(401).json({ status: FAIL, data: { message: "You do not have permission to create an order" } });
        }
        const { COD, couponApplied } = req.body;
        if (!COD) {
            return res.status(401).json({ status: FAIL, data: { message: "Creating cash order failed" } });
        }

        // Logging to check the userCart
        const userCart = await cartModel.findOne({ orderBy: req.user.id });

        if (!userCart || !userCart.cart || userCart.cart.length === 0) {
            return res.status(404).json({ status: FAIL, data: { message: "User cart or products not found" } });
        }

        // Check if userCart.cart is an array before using map
        if (!Array.isArray(userCart.cart)) {
            return res.status(404).json({ status: FAIL, data: { message: "User cart products not found or not in the expected format" } });
        }

        let finalPrice = 0;
        if (couponApplied && userCart.priceAfterDiscount) {
            finalPrice = userCart.priceAfterDiscount;
        } else {
            finalPrice = userCart.totalPrice;
        }

        let newOrder = await new orderModel({
            products: userCart.cart, 
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                finalPrice: finalPrice,
                status: "Cash on Delivery",
                created: Date.now(),
                currency: "usd",
            },
            orderBy: req.user.id,
            orderStatus: "Cash on Delivery",
        }).save();

        let update = userCart.cart.map((item) => { // Use userCart.cart instead of userCart.products
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: { $inc: { quantity: item.count, sold: +item.count } },
                },
            };
        });

        const updated = await productModel.bulkWrite(update, {});

        res.status(200).json({ status: SUCCESS, message: "order created successfully"});
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

const getOrder=async(req,res)=>{
    try {

        const userOrder=await orderModel.findOne({orderBy:req.user.id})

        res.status(200).json({ status: SUCCESS, message: "order get successfully" ,data: userOrder});
        
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }

}


const removeItemFromCart = async(req,res) =>{

    if (!req.user.id) {
        return res.status(401).json({ status: FAIL, data: { message: "You do not have permission to remove Item" } });
    }

    
    const cart = await cartModel.findOneAndUpdate(
        { user: req.user._id },
        { $pull: { cart: { _id: req.params.id } } },
        { new: true }
        );
        pricCalc(cart); 
        !cart && res.status(404).json({status: FAIL, message: "cart Not found" });
        cart && res.status(200).json({status: SUCCESS, message: "cart updated", cart })
    }

const updateCount = async (req, res) => {
        try {
            if (!req.user.id) {
                return res.status(401).json({ status: FAIL, data: { message: "You do not have permission to update count" } });
            }
    
            const cart = await cartModel.findOne({ orderBy: req.user.id });
    
            // if cart does not exist, return 404
            if (!cart) {
                return res.status(404).json({ status: FAIL, message: "Cart not found" });
            }
    
            // Find the item in the cart based on its ID
            const item = cart.cart.find((item) => item._id.toString() === req.params.id);
    
            // if item not found, return 404
            if (!item) {
                return res.status(404).json({ status: FAIL, message: "Item not found in the cart" });
            }
    
            // Update the quantity of the item
            item.count = req.body.count;
    
            // Calculate the total price
            await pricCalc(cart);
    
            // Save the updated cart
            await cart.save();
    
            // Send the response
            res.status(200).json({ status: SUCCESS, message: "Cart updated successfully", cart });
        } catch (error) {
            res.status(500).json({ status: ERROR, message: error.message, data: null });
        }
};
    

    
    
    

export {
    userCart,
    getUserCart,
    emptyCart,
    updateCart,
    applyCoupon,
    createOrder,
    getOrder,
    removeItemFromCart,
    updateCount

}


