import express from 'express';
const authRouter = express.Router();
import passport from 'passport';

import { generateAccessAndRefreshTokens } from '../controllers/user.controllers.js';

const cookieOption = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
};

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

authRouter.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    async (req, res, next) => {
        try {
            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(req.user._id);
            res
                .status(200)
                .cookie('accessToken', accessToken, cookieOption)
                .cookie('refreshToken', refreshToken, cookieOption)
                .redirect(process.env.FRONTEND_URL || '/');
        } catch (err) {
            next(err);
        }
    },
);


export default authRouter;
