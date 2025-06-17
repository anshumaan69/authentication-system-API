import express from 'express';
import {emailverification, login,logout,register, verifyOtp} from '../controller/authController.js'
import userAuth from '../middleware/userAuth.js';

export const authRouter = express.Router();

authRouter.post('/register',register)
authRouter.post('/login',login)
authRouter.post('/logout',logout)
authRouter.post('/send-verify-otp',userAuth,verifyOtp)
authRouter.post('/verify-account',userAuth,emailverification)
