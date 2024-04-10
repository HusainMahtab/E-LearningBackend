import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: 'dhis5nnde', 
  api_key: '613591257363619', 
  api_secret: 'HO1Q6nwFkWIv74auopmYSiHh0-o' 
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });

        // Remove the locally temporary file
        fs.unlinkSync(localFilePath);

        // Return the Cloudinary response
        return response;
       
    } catch (error) {
        // Handle error
        console.error("Error uploading file to Cloudinary:", error);
        
        // Remove the locally temporary file as the upload operation failed
        fs.unlinkSync(localFilePath);

        // Return null to indicate failure
        return null;
    }
}

export { uploadOnCloudinary };
