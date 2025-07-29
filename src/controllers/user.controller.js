import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from "../utils/asyncHandler.js";
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
// @throws ApiError - 400, 401, 404, 500
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
        throw new ApiError(401, "Invalid credentials");
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

export {
    registerUser,
    loginUser
};