import 'dotenv/config'
import express, {json} from 'express';
import path from 'path'; 
import connectDB from './DB/connectionDB.js';
import userRouter  from './src/modules/userModules/user.routes.js';
import adminRouter from './src/modules/adminModules/admin.routes.js';
import cors from 'cors';
import categoryRouter from './src/modules/categoryModules/category.routes.js';
import productRouter from './src/modules/productModules/product.routes.js';
import cartRouter from './src/modules/cartModules/cart.routes.js';
import couponRouter from './src/modules/couponModules/coupon.routes.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();

app.use("/upload", express.static(path.join(__dirname, 'src', 'upload')));


connectDB();

app.use(cors());

app.use(json());

app.use('/users',userRouter);

app.use('/admin',adminRouter);

app.use('/category',categoryRouter);

app.use('/product',productRouter);

app.use('/cart',cartRouter);

app.use('/coupon',couponRouter);

app.listen(5000 , () =>{
    console.log("listen on port 5000");
})
