import express from 'express';
const userRouter = express.Router();
import verifyJWT from '../middlewares/user.middlewares.js';

import {
    registerUser,
    loginUser,
    logoutUser,
    updatePassword,
    refreshAccessToken,
} from '../controllers/user.controllers.js';

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/logout', verifyJWT, logoutUser);
userRouter.post('/update-password', verifyJWT, updatePassword);
userRouter.post('/refreshToken', refreshAccessToken);


export default userRouter;
