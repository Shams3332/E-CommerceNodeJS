import jwt from 'jsonwebtoken';
import { ERROR, FAIL } from '../utils/httpStatusText.js';

export const auth = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ status: ERROR, message: 'No token provided', data: null });
    }

    const token = authorization.split(' ')[1];

    jwt.verify(token, 'finalProject', (error, decoded) => {
        if (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ status: ERROR, message: 'Token expired', data: null });
            } else {
                return res.status(401).json({ status: ERROR, message: 'Invalid token', data: null });
            }
        }
        req.user = decoded; 
        if(req.user.isActive == false){
            return res.status(401).json({ status: FAIL, message: 'please active your account first', data: null });
        }
        next();
    });
};


export const authAdmin = (req, res, next) => {
    auth(req, res, () => {

        if (req.user.role !== 'admin') {
            return res.status(403).json({ status: ERROR, message: 'You are not an admin', data: null });
        }

        next();
    });
};


