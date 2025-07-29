import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import {uploadOnCloudinary, deleteFromCloudinary} from '../utils/cloudinary.js';


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
    
        // if we don't find user
        if(!user){
            throw new ApiError(404, "No user found for token generation");
        }
    
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefeshToken();
    
        user.refreshToken = refreshToken;
        await user.save({validatBeforeSave: false});
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens");
    }
}



// @POST /api/v1/user/register
// @desc Register a new user
// @access Public
// @files avatar, coverImage
// @body fullName, email, username, password
// @returns {ApiResponse} - User object with status code 201
// @throws ApiError - 400, 409, 500
const registerUser = asyncHandler(async (req, res) => {
    const {fullName, email, username, password} = req.body;

    // validation
    if(
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    const existUser = await User.findOne({
        $or: [{username}, {email}]
    });

    if(existUser){
        throw new ApiError(409, "User with username or email already exist");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;


    let avatar;
    try{
        avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log("uploaded avatar", avatar, "\npath: ", avatarLocalPath);
    }
    catch(error){
        console.log("Error uploading avatar", error);
        throw new ApiError(500, "failed to upload avatar");
    }

    let coverImage;
    try{
        coverImage = await uploadOnCloudinary(coverLocalPath);
        console.log("uploaded coverImage", coverImage);
        
    }
    catch(error){
        console.log("Error uploading coverImage", error);
        throw new ApiError(500, "failed to upload coverImage");
    }


    try {
        const user = await User.create({
            fullname: fullName,
            avatar: avatar?.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        });
    
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken -coverImage"
        );
    
        if(!createdUser){
            console.log(`User creation failed 54: ${user}`);
            throw new ApiError(500, "something went wrong while registering a user...");
        }
    
        return res
            .status(201)
            .json(new ApiResponse(200, createdUser, "User registered successfully"))
    } 
    catch (error) {
        console.log(`User creation failed`);
        if(avatar){
            await deleteFromCloudinary(avatar.public_id);
        }
        if(coverImage){
            await deleteFromCloudinary(coverImage.public_id);
        }
        throw new ApiError(500, "something went wrong while registering a user...\nImages were deleted");
    }

});



// @POST /api/v1/user/login
// @desc Login a user
// @access Public
// @body email, password
// @returns {ApiResponse} - User object with status code 200
// @throws ApiError - 400, 404, 500
// @cookies accessToken, refreshToken
const loginUser = asyncHandler(async (req, res) => {    
    const {email, password} = req.body;
    // validation
    if([email, password].some((field) => field.trim === "")){
        throw new ApiError(400, "All fields are required");
    }
    const user = await User.findOne({email}).select("+password +refreshToken");
    if(!user){
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(400, "Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);


    //  fail safe query
    const loggedInUser = await User.findById(user._id)
        .select("-fullname -password -refreshToken -coverImage");
    
    // checking if user is saved successfully
    if(!loggedInUser){
        throw new ApiError(500, "Something went wrong while logging in");
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 10 * 24 * 60 * 60 * 1000
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(
            200, 
            {
                user: loggedInUser, 
                accessToken,
                refreshToken
            }, "User logged in successfully"));
    
});


// @POST /api/v1/user/refresh-token
// @desc Refresh access token
// @access Public
// @body refreshToken
// @returns {ApiResponse} - New access token with status code 200
// @throws ApiError - 401, 500
// @cookies refreshToken, accessToken
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "refresh token is required");
    }

    try{
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);

        if(!user){
            throw new ApiError("invalid refresh token");
        }

        if(user?.refreshToken !== incomingRefreshToken){
            throw new ApiError("Refresh token is expired, login again...");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(new ApiResponse(
                200, 
                {
                    user: loggedInUser, 
                    accessToken,
                    refreshToken: newRefreshToken
                }, "Access token refreshed successfully"));
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while refreshing the access token");
    }
});


// @POST /api/v1/user/logout
// @desc Log out a user
// @access Private
// @returns {ApiResponse} - Success message with status code 200
// @throws ApiError - 500
// @cookies accessToken, refreshToken
// @body none
const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            }
        },
        {new: true}
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logged out successfully"))
});


// @POST /api/v1/user/change-password
// @desc Change current user's password
// @access Private
// @body oldPassword, newPassword
// @returns {ApiResponse} - Success message with status code 200
// @throws ApiError - 400, 500
// @cookies accessToken, refreshToken
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(isPasswordCorrect){
        throw new ApiError(400, "Old password is incorrect.");
    }

    user.password = newPassword;    // as we have already set the prehook to update the password by hashing it we don't need to hash it here
    user = await user.save({validatBeforeSave: false});

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, "The password updated successfully."))
});


// @GET /api/v1/user/current
// @desc Get current user's details
// @access Private
// @returns {ApiResponse} - User object with status code 200
// @throws ApiError - 500
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "Current user details");
});


// @POST /api/v1/user/update-details
// @desc Update current user's details
// @access Private
// @body fullName, username
// @returns {ApiResponse} - Updated user object with status code 203
// @throws ApiError - 400, 500
// @cookies accessToken, refreshToken
const updateAccountDetails = asyncHandler(async (req, res) => {

    const {fullName, username} = req.body;
    if(!fullName || !username){
        throw new ApiError(400, "All fields are mandatory");
    }

    const user = await User.findById(req.user?._id);

    const userWithSameUsername = await User.findOne({username});
    if(userWithSameUsername){
        throw new ApiError(400, "Username already exist");
    }

    user.fullName = fullName;
    user.username = username;

    await user.save({validatBeforeSave: false});

    req.user = await User.findOne({username}).select("-password -refreshToken");

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(req.user._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(203)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(203, req.user, "User details updated."))

});


// POST /api/v1/user/update-avatar
// @desc Update current user's avatar
// @access Private
// @files avatar
// @returns {ApiResponse} - Updated user object with status code 200
// @throws ApiError - 404, 500
// @cookies accessToken, refreshToken
// @body none
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(404, "File Not found.");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(500, "Failed to upload avatar");
    }

    const user = await User.findById(req.user._id);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    // delete old avatar from cloudinary
    if(user.avatar){
        try {
            await deleteFromCloudinary(user.avatar);
        } catch (error) {
            console.error("Failed to delete old avatar from cloudinary", error);
        }
    }

    user.avatar = avatar.url;
    await user.save({validateBeforeSave: false});

    const updatedUser = await User.findById(user._id).select("-password -refreshToken -coverImage");

    if(!updatedUser){
        throw new ApiError(500, "Something went wrong while updating avatar");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(
            200, 
            {
                user: updatedUser, 
                accessToken,
                refreshToken
            }, "Avatar updated successfully"));
});


// POST /api/v1/user/update-cover-image
// @desc Update current user's cover image
// @access Private
// @files coverImage
// @returns {ApiResponse} - Updated user object with status code 200
// @throws ApiError - 404, 500
// @cookies accessToken, refreshToken
// @body none
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverLocalPath = req.file?.path;

    if(!coverLocalPath){
        throw new ApiError(404, "File Not found.");
    }

    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if(!coverImage.url){
        throw new ApiError(500, "Failed to upload cover image");
    }

    const user = await User.findById(req.user._id);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    // delete old cover image from cloudinary
    if(user.coverImage){
        try {
            await deleteFromCloudinary(user.coverImage);
        } catch (error) {
            console.error("Failed to delete old cover image from cloudinary", error);
        }
    }

    user.coverImage = coverImage.url;
    await user.save({validateBeforeSave: false});

    const updatedUser = await User.findById(user._id).select("-password -refreshToken -coverImage");

    if(!updatedUser){
        throw new ApiError(500, "Something went wrong while updating cover image");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(
            200, 
            {
                user: updatedUser, 
                accessToken,
                refreshToken
            }, "Cover image updated successfully"));
});


export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logOutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};