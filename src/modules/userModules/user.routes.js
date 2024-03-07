// user.routes.js
import { signUp, signIn, verifyAccount, forgetPassword, resetPassword,verifyCode ,deactivateUser ,userData} from "./user.controller.js";
import { Router } from "express";
import { signUpSchema, signInSchema ,resetPasswordSchema} from './user.validation.js';
import { validation } from '../../middleware/validation.js';
import { auth } from './../../middleware/auth.js';

const userRouter = Router();

userRouter.post("/signUp", validation(signUpSchema), signUp);
userRouter.post("/signIn", validation(signInSchema), signIn);
userRouter.get('/verify/:token', verifyAccount);


userRouter.post('/forgetPassword', forgetPassword);
userRouter.post('/verifyCode', verifyCode); 
userRouter.post('/resetPassword',validation(resetPasswordSchema), resetPassword); 

userRouter.put('/deactivateUser/:Id', auth, deactivateUser);

userRouter.get('/userData/:userId',auth,userData)

export default userRouter;
