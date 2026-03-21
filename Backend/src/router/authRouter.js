import express from 'express';
const authRouter = express.Router();
import passport from 'passport';

import { generateAccessAndRefreshTokens } from '../controllers/user.controllers.js';

const cookieOption = {
    httpOnly : true,
    secure : true,
}

authRouter.get('/auth/google',  passport.authenticate('google', { scope: ['profile'] }));

authRouter.get('/auth/google/callback',  passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const { accessToken, refreshToken } = generateAccessAndRefreshTokens(req.user._id);
        res.status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .redirect('/');
    }
);


export default authRouter;
