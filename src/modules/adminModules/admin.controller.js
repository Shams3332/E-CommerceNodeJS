import userModel from '../../../DB/models/users.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SUCCESS, FAIL, ERROR } from '../../utils/httpStatusText.js';
import { notifyAdminAboutUpdate } from '../../services/sendEmail.js';


const verifyAccount = (req, res) => {
    let { token } = req.params;
    jwt.verify(token, "NewUser", async (err, decoded) => {
        let userFound = await userModel.findById(decoded.id);
        if (!userFound) 
        { return  res.json({ message: "invalid user" });}
        let updatedUser = await userModel.findByIdAndUpdate(decoded.id,{ isVerify: true },{ new: true });
        res.json({ message: "User Verified", updatedUser });
    });
};

const signInAdmin = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        let foundUser = await userModel.findOne({ email });

        if (!foundUser) {
            return res.status(404).json({ status: FAIL, data: { message: 'You need to register first' } });
        }

        if (!foundUser.isVerify) {
            return res.status(401).json({ status: FAIL, data: { message: 'Please verify your account first' } });
        }

        let matchedPassword = bcrypt.compareSync(password, foundUser.password);

        if (matchedPassword) {
            if (foundUser.role=="admin") {
                let token = jwt.sign({ id: foundUser._id, role: foundUser.role,isActive:foundUser.isActive }, 'finalProject');
                let role = foundUser.role;
                return res.status(200).json({ status: SUCCESS, data: { message: 'Welcome, admin!', token , role} });
            } else {
                return res.status(403).json({ status: FAIL, data: { message: 'You are not an admin' } });
            }
        } else {
            return res.status(401).json({ status: FAIL, data: { message: 'Invalid password' } });
        }
    } catch (error) {
        return res.status(500).json({ status: ERROR, message: 'Internal server error', data: null });
    }
};

const updateUserRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ status: FAIL, data: { message: 'You do not have permission to add product' } })
        }

        const { field, value } = req.body;

        // Fetch the user to update
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: { pendingUpdate: { field, value } } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ status: FAIL, data: { message: 'User not found' } });
        }

        // Notify admin about the update request
        notifyAdminAboutUpdate(updatedUser, field, value);

        res.status(200).json({ status: SUCCESS, data: { message: 'Update request sent to admin' } });
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

// Confirm update by admin
export const confirmUpdateByAdmin = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const updatedUser = await userModel.findById(userId);
  
      if (!updatedUser) {
        return res.status(404).json({ status: 'FAIL', data: { message: 'User not found' } });
      }
  
      // Apply the pending update
      const { field, value } = updatedUser.pendingUpdate;
  
      const confirmedUser = await userModel.findByIdAndUpdate(
        userId,
        { $set: { [field]: value, pendingUpdate: null } },
        { new: true }
      );
  
      res.status(200).json({ status: 'SUCCESS', data: { confirmedUser } });
    } catch (error) {
      res.status(500).json({ status: 'ERROR', message: error.message, data: null });
    }
  };





export { 
    signInAdmin,
    verifyAccount,
    updateUserRequest,

};
