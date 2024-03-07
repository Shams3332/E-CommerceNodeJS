import { auth, authAdmin } from "../../middleware/auth.js";
import {confirmUpdateByAdmin, signInAdmin , updateUserRequest, verifyAccount } from "./admin.controller.js";
import { Router } from "express";


const adminRouter = Router();



adminRouter.get('/verify/:token', verifyAccount);
adminRouter.post("/signIn",signInAdmin);

adminRouter.put("/updateUserRequest",auth ,updateUserRequest);

adminRouter.put('/confirmUpdate/:userId', authAdmin, confirmUpdateByAdmin);


export default adminRouter;