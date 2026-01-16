import express from 'express';
import { loginWithGoogle,registerUser , loginUser , getProfile , updateProfile , bookAppointment , listAppointment , cancelAppointment , createRazorpayOrder , verifyRazorpayPayment} from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'

const userRouter = express.Router();
// userRouter.post('/google-login', loginWithGoogle);
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

userRouter.post("/google-login", loginWithGoogle);
// userRouter.post('/link-google', authUser, linkGoogle);
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/appointments',authUser,listAppointment)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.post('/payment-razorpay',authUser,createRazorpayOrder)
userRouter.post('/verifyRazorpay',authUser,verifyRazorpayPayment)

export default userRouter;