import userModel from '../../../DB/models/users.model.js';
import bcrypt from 'bcrypt';
import { SUCCESS, FAIL, ERROR } from '../../utils/httpStatusText.js';
import jwt from 'jsonwebtoken';
import { sendOurEmail, sendResetPasswordMail } from '../../services/sendEmail.js';
import randomstring from 'randomstring';
import { signUpSchema } from './user.validation.js';

const signUp = async (req, res) => {
    try {
      
      const { error } = signUpSchema.body.validate(req.body);
  
      if (error) {
        return res.status(400).json({ status: FAIL, data: { message: error.details[0].message } });
      }
  
      const { userName, email, password, CPassword, addresses, age, phone } = req.body;
  
      if (password !== CPassword) {
        return res.status(400).json({ status: FAIL, data: { message: "Password does not match" } });
      }
  
      let foundUser = await userModel.findOne({ email });
  
      if (foundUser) {
        return res.status(400).json({ status: FAIL, data: { message: "User already registered" } });
      }
  
      // Only continue if no errors are encountered
      let hashedPassword = bcrypt.hashSync(password, 10);
      const addUser = await userModel.create({
        userName,
        email,
        password: hashedPassword,
        addresses,
        age,
        phone,
        role: req.body.role,
      });
  
      // Send verification email
      let token = jwt.sign({ id: addUser._id }, "NewUser"); // Replace with your actual secret
      let url = `http://localhost:5000/users/verify/${token}`;
      sendOurEmail(email, url);
  
      res.status(201).json({ status: SUCCESS, message: "Please verify your email before logging in", data: { addUser } });
    } catch (error) {
      res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
  };
  

const verifyAccount = (req, res) => {
    let { token } = req.params;
    jwt.verify(token, "NewUser", async (err, decoded) => {
        let userFound = await userModel.findById(decoded.id);
        if (!userFound) { return res.json({ message: "invalid user" }); }
        let updatedUser = await userModel.findByIdAndUpdate(decoded.id, { isVerify: true }, { new: true });
        res.json({ message: "User Verified", updatedUser });
    });
};

const signIn = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        let foundUser = await userModel.findOne({ email });


        if (!foundUser) {
            return res.status(404).json({ status: FAIL, data: { message: 'You need to register first' } });
        }

        if (!foundUser.isVerify) {
            return res.json({ status: FAIL, data: { message: 'Please verify your account first' } });
        }

        let matchedPassword = bcrypt.compareSync(password, foundUser.password);

        if (matchedPassword) {
            let role = foundUser.role;
            let ID = foundUser._id;
            let token = jwt.sign({ id: foundUser._id, isActive: foundUser.isActive }, 'finalProject');
            return res.status(200).json({ status: SUCCESS, data: { message: 'Welcome', token, role, ID } });
        } else {
            return res.status(404).json({ status: FAIL, data: { message: 'Invalid password' } });
        }
    } catch (error) {

        return res.status(500).json({ status: FAIL, data: { message: 'Internal server error' } });
    }
};

// forget and resetPassword

const securePassword = async (password) => {
    const saltRounds = 10;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw new Error(`Error hashing password: ${error.message}`);
    }
};

const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const foundUser = await userModel.findOne({ email });

        if (foundUser) {
            const randomCode = randomstring.generate();
            const expirationTime = new Date();
            expirationTime.setMinutes(expirationTime.getMinutes() + 15); // Set expiration to 15 minutes

            const updatedDate = await userModel.updateOne(
                { email },
                { $set: { resetCode: randomCode, resetCodeExpiration: expirationTime } }
            );

            // Send the random code to the user via email
            sendResetPasswordMail(foundUser.userName, foundUser.email, randomCode);

            return res.status(200).json({
                status: SUCCESS,
                data: { message: 'Please check your email for the verification code' }
            });
        } else {
            return res.status(404).json({ status: FAIL, data: { message: 'User not found' } });
        }
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

const verifyCode = async (req, res) => {
    try {
        const { email, resetCode } = req.body;

        const foundUser = await userModel.findOne({ email, resetCode });

        if (foundUser) {
            return res.status(200).json({ status: SUCCESS, data: { message: 'Code verification successful' } });
        } else {
            return res.status(404).json({ status: FAIL, data: { message: 'Invalid code or email' } });
        }
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};

const resetPassword = async (req, res) => {
    try {
        const password = req.body.password;
        const user_email = req.body.email;

        if (!user_email) {
            return res.status(400).json({ status: FAIL, data: { message: 'User email is missing' } });
        }

        const secure_password = await securePassword(password);
        const updatedData = await userModel.findOneAndUpdate({ email: user_email }, { $set: { password: secure_password, token: '' } });

        if (!updatedData) {
            return res.status(404).json({ status: FAIL, data: { message: 'User not found' } });
        }

        return res.status(200).json({ status: SUCCESS, data: { message: 'Passwordresut success' } });
    } catch (error) {
        res.status(500).json({ status: FAIL, message: error.message, data: null });
    }
};

// end forget and reset password


// deactivateUser 

const deactivateUser = async (req, res) => {
    try {
        if (req.params.Id !== req.userId) {
            return res.status(403).json({ status: ERROR, message: 'You are not authorized to deactivate this account', data: null });
        }
        const deactivate = await userModel.findByIdAndUpdate(req.userId, { isActive: false }, { new: true });
        res.status(200).json({ status: SUCCESS, data: { message: 'Your account deactivation was successful', deactivate } });
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};


// user profile

const userData = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ status: FAIL, data: { message: 'user not found' } });
        }

        res.status(200).json({ status: SUCCESS, data: user });
    } catch (error) {
        res.status(500).json({ status: ERROR, message: error.message, data: null });
    }
};





export {
    signUp,
    signIn,
    verifyAccount,
    forgetPassword,
    resetPassword,
    verifyCode,
    deactivateUser,
    userData

};





