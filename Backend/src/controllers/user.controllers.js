import asyncHandler from '../utils/asyncHandler.js';
import { User } from '../models/user.models.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/Email.js';

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } 
    
    catch (error) {
        throw new ApiError(500, 'Something went wrong while generating tokens', { error });
    }
}

const registerUser = asyncHandler (async (req, res) => {
    const { email, password, fullName } = req.body;

    if ([email, password, fullName].some((field) => !field || String(field).trim() === '')) {
        throw new ApiError(400, 'All fields are required', { email, password, fullName });
    }

    const existedUser = await User.findOne({
        $or: [{ fullName }, { email }],
    });

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists", { fullName, email });
    }

    const user = await User.create({
        email,
        password,
        fullName,
    });



    const token = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/users/verify-email?token=${token}`;

    await sendEmail({
        to: email,
        subject: 'Verify your email',
        text: `Verify your email: ${verifyUrl}`,
    });

    const createdUser = await User.findById(user?._id).select('-password -refreshToken');

    if (!createdUser) {
        throw new ApiError(500, 'Something went wrong while registering the user', { fullName, email });
    }

    return res.status(201)
    .json(new ApiResponse(201, 'User registered successfully. Please verify email.', createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
    const { identifier, email, fullName, password } = req.body;
    const loginId = identifier || email || fullName;

    if (!loginId) {
        throw new ApiError(400, 'Email or fullName is required', { email, fullName });
    }

    const user = await User.findOne({
        $or: [{ email: loginId }, { fullName: loginId }],
    });

    if (!user) {
        throw new ApiError(404, 'User not found', { loginId });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid password', { loginId });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user?._id);

    const loggedInUser = await User.findById(user?._id).select('-password -refreshToken');

    if (!loggedInUser) {
        throw new ApiError(500, 'Something went wrong while logging in the user', { loginId });
    }

    const cookieOption = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, cookieOption)
        .cookie('refreshToken', refreshToken, cookieOption)
        .json(
            new ApiResponse(200, 'User logged in successfully', {
                user: loggedInUser,
                accessToken,
                refreshToken,
            }),
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { refreshToken: '' } },
        { new: true },
    );

    const cookieOption = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    };

    return res
        .status(200)
        .clearCookie('accessToken', cookieOption)
        .clearCookie('refreshToken', cookieOption)
        .json(new ApiResponse(200, 'User logged out successfully', {}));
});

const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, 'All fields are required', { oldPassword, newPassword });
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(400, 'New password and confirm password do not match', { newPassword, confirmPassword });
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, 'User not found', { oldPassword, newPassword });
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid old password', { oldPassword, newPassword });
    }

    user.password = newPassword;

    const savepassword = await user.save({ validateBeforeSave: false });

    if (!savepassword) {
        throw new ApiError(500, 'Something went wrong while updating the password', { oldPassword, newPassword });
    }

    console.log('savePassword ', savepassword);

    return res.status(200).json(new ApiResponse(200, 'Password updated successfully', {}));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Unauthorized request');
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, 'Invalid refresh token');
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh token is expired or used');
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        const cookieOption = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        };

        return res
            .status(200)
            .cookie('accessToken', accessToken, cookieOption)
            .cookie('refreshToken', newRefreshToken, cookieOption)
            .json(new ApiResponse(200, 'Access token refreshed successfully', { accessToken, refreshToken: newRefreshToken }));
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid refresh token');
    }
});


const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;
    if (!token) {
        throw new ApiError(400, 'Verification token is required');
    }
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        emailVerificationToken: hashed,
        emailVerificationExpires: { $gt: Date.now() },
    });
    if (!user) {
        throw new ApiError(400, 'Invalid or expired verification token');
    }
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, 'Email verified successfully', {}));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, 'Current user', req.user));
});

const listUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password -refreshToken');
    return res.status(200).json(new ApiResponse(200, 'Users', users));
});
export {
    registerUser,
    loginUser,
    logoutUser,
    updatePassword,
    refreshAccessToken,
    generateAccessAndRefreshTokens,
    verifyEmail,
    getCurrentUser,
    listUsers,
}


