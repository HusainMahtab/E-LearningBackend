import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";

cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret:process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary=async(localFilePath)=>{
    try {
        if (!localFilePath) return null
        //Upload file on cloudinary
        const responce=await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"}) 
            console.log(responce)
        // file has been uploaded succefully
        console.log("file is successfully uploaded on cloudinary",responce.url)
        fs.unlinkSync(localFilePath);
        return responce
       
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally temporary file as the upload operation got failed
        return null
    }
}


export {uploadOnCloudinary};