import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";


export const verifyJWT = asyncHandler(async (req, __dirname, next) => {

    const token = req.cookies.accessToken || req.body.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if(!token){
        throw new ApiError("401", "Unauthorized");
    }

    try{
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(401, "Unauthorized");
        }
        
        req.user = user;
        next()
    }
    catch(error){
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});