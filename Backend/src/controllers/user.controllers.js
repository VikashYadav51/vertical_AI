import asyncHandler  from '../utils/asyncHandler.js';
import { User } from '../models/user.models.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

const generateAccessAndRefreshTokens = async(userId) =>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.accessToken();
        const refreshToken = user.refreshTokens();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave : false });

        return { accessToken, refreshToken };
    }

    catch(error){
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens", { error });
    }
}

const registerUser = asyncHandler( async(req, res) =>{
    const{ email, password, fullName } = req.body;

    if([email, password, fullName].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required", {email, password, fullName });
    }

    const existedUser = await User.findOne({
        $or : [{fullName}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists", { fullName, email });
    }

    const user = await User.create({
        email,
        password,
        fullName,
    });



    const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken "
    );

    if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user", { fullName, email });
    }

    return res.status(201).json(
    new ApiResponse(200, "User registered successfully", createdUser)
    );
});

const loginUser = asyncHandler( async(req, res) =>{
    const { userName, email, password } = req.body;
    
    if( userName === "" && email === ""){
        throw new ApiError(400, "Username or email is required", { userName, email });
    }

    const user = await User.findOne({
        $or : [{userName}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User not found", { userName, email });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid password", { userName, email });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user?._id);

    const loggedInUser = await User.findById(user?._id).select(
        "-password -refreshToken"
    );

    if(!loggedInUser){
        throw new ApiError(500, "Something went wrong while logging in the user", { userName, email });
    }

    return res.status(200).json(
        new ApiResponse(200, "User logged in successfully", {
            user : loggedInUser,
            accessToken,
            refreshToken,
        })
    )
});

const logoutUser = asyncHandler( async(req, res) =>{
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                refreshToken : "",
            }
        },

        {
            new : true,
        }
    )

    const cookieOption = {
        httpOnly : true,
        secure : true,
    }


    return res.status(200)
    .clearCookie("accessToken", cookieOption)
    .clearCookie("refreshToken", cookieOption)
    .json(
        new ApiResponse(200, "User logged out successfully", {})
    )
});

const updatePassword = asyncHandler( async( req, res) =>{
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if(!(oldPassword || newPassword )){
        throw new ApiError(400, "All fields are required", { oldPassword, newPassword });
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(400, "New password and confirm password do not match", { newPassword, confirmPassword });
    }

    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(404, "User not found", { oldPassword, newPassword });
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid old password", { oldPassword, newPassword });
    }

    user.password = newPassword;

    const savepassword = await user.save({ validateBeforeSave : false });

    if(!savepassword){
        throw new ApiError(500, "Something went wrong while updating the password", { oldPassword, newPassword });
    }

    console.log("savePassword ", savepassword);


    return res.status(200).json(
        new ApiResponse(200, "Password updated successfully", {})
    )
});


const refreshAccessToken = asyncHandler( async(req, res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, 'Unauthorized request' );
    }

    try{
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);

        const user = await User.findById(decodedToken?._id);    
        if(!user){
            throw new ApiError(401, 'Invalid refresh token')
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, 'Refresh token is expired or used')
        }

        const { accessToken, refreshToken: newRefreshToken } =  await generateAccessAndRefreshTokens(user._id);

        const cookieOption = {
            httpOnly : true,
            secure : true,
        }

        return res.status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", newRefreshToken, cookieOption)
        .json(
            new ApiResponse(200, "Access token refreshed successfully", { accessToken, refreshToken: newRefreshToken })
        )
    } 
    
    catch (error) {
        throw new ApiError(401, error?.message || 'Invalid refresh token');
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    updatePassword,
    refreshAccessToken,
    generateAccessAndRefreshTokens,
}


