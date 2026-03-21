import express from 'express';
const userRouter = express.Router();
import verifyJWT, { requireRoles } from '../middlewares/user.middlewares.js';

import {
    registerUser,
    loginUser,
    logoutUser,
    updatePassword,
    refreshAccessToken,
    verifyEmail,
    getCurrentUser,
    listUsers,
} from '../controllers/user.controllers.js';

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/logout', verifyJWT, logoutUser);
userRouter.post('/update-password', verifyJWT, updatePassword);
userRouter.post('/refreshToken', refreshAccessToken);
userRouter.get('/verify-email', verifyEmail);
userRouter.get('/me', verifyJWT, getCurrentUser);
userRouter.get('/admin/users', verifyJWT, requireRoles('admin'), listUsers);


export default userRouter;
