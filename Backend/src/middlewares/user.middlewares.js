import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

import User from '../models/user.models.js';
import jwt from 'jsonwebtoken';


const verifyJWT = asyncHandler( async(err, req, res, next) =>{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if(!token){
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if(!decodedToken){
        throw new ApiError(401, "Invalid access token");
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if(!user){
        throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
})

export default verifyJWT;