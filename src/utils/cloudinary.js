import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// configure cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    
    try{
        if(!localFilePath){
            return null;
        }
        // console.log("started image upload", localFilePath);
        const response = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type: "auto"
            }
        )
        
        console.log(`file uploaded on cloudinary\nfile path: ${localFilePath}\n\n`);
        fs.unlinkSync(localFilePath);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath);
        // console.log("Error in uploading image: ", error);
        
        return null;
    }
}


const deleteFromCloudinary = async (publicId) => {
    try{
        const result = await(cloudinary.uploader.destroy(publicId));
        console.log(`Deleted from cloudinary: ${result}`);
        return result;
    }
    catch(error){
        console.log(`Error while deleting from cloudinary: \n\n${error}`);
        return null;
    }
}

export {uploadOnCloudinary, deleteFromCloudinary};