import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.models.js";
import {uploadOnCloudinary, deleteFromCloudinary} from '../utils/cloudinary.js';

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


export {
    registerUser
};