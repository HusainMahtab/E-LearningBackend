import { User } from "../models/user.model.js";
import {ApiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {sendEmail} from "../utils/sendEmail.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import crypto from "crypto"
// Generate AccessToken and Refresh Token
const generateAceessAndRefreshToken=async(userId)=>{
     try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
     } catch (error) {
         throw new ApiError(500,"Someting went wrong while generating access and refresh Token")
     }
}

// register user
const registerUsers=asyncHandler(async(req,res,)=>{
    const {name,email,password,role,}=req.body

    if(name==="" || email==="" || password===""){
        throw new ApiError(402,"these fields are required")
    }

   const isuserExist=await User.findOne({
       $or:[{email},{name}]
   })

   if(isuserExist){
    throw new ApiError(500,"User already exist")
   }
   
   const avatarLocalPath=req.files?.avatar[0]?.path;

   console.log(avatarLocalPath)

   let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
        coverImageLocalPath=req.files.coverImage[0].path
    }


   if(!avatarLocalPath){
      throw new ApiError(404,"avatar localfilePath is missing")
   }

   const avatar=await uploadOnCloudinary(avatarLocalPath)

   console.log("avatar",avatar)

   const coverImage=await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
    throw new ApiError(500,"avatar file is not uploaded")
   }
   

   const user=await User.create({
       name,
       email:email.toLowerCase(),
       password,
       avatar:avatar.url,
       coverImage:coverImage?.url || "",
       role
   })

   if(!user){
    throw new ApiError("error while creating a user !")
   }

   const {accessToken,refreshToken}=await generateAceessAndRefreshToken(user._id)
   
   const options={
    httpOnly:true,
    secure:true
   }

   const message="You are Succeefully Register E-Learning Backend"
   
   try {

    await sendEmail({
        email:user.email,
        subject:`E-LearningBackend Registration`,
        message
    })

    return res
   .status(200)
   .cookie("AccessToken",accessToken,options)
   .cookie("RefreshToken",refreshToken,options)
   .json(new apiResponse(200,user,"User created Successfully"))
    
} catch (error) {
    user.resetPasswordToken=undefined
    user.resetPasswrodExpire=undefined
    user.save({validateBeforeSave:false})
    throw new ApiError(500,error.message)
}

   
})

// Login Users
const loginUser = asyncHandler(async (req, res) => {
    const { email, name, password } = req.body;

    if (!(email || name)) {
        throw new ApiError(404, "name or email is required");
    }
    
    const user= await User.findOne({
        $or:[{email},{name}]
    }).select("+password")
   
    if (!user) {
        throw new ApiError(404, "User not found. Please register first.");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is not correct");
    }

    const { accessToken, refreshToken } = await generateAceessAndRefreshToken(user._id);

    // Use User.findById instead of user.findById
    const loggedInUser = await User.findById(user._id);
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

// logOutUser
const logOutUser=asyncHandler(async(req,res,)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            },
           
        },
        {
            new:true
        }
        
        )

        const options={
            httpOnly:true,
            expires:new Date(Date.now()),
            secure:true
        }

        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new apiResponse(200,{},"User logout Successfully"))
})

// forgot password
const forgotPassword=asyncHandler(async(req,res,)=>{
    const {email}=req.body
    const user=await User.findOne({email})
    if(!user){
        throw new ApiError(404,"User does't found!")
    }

    // getResetPasswordToken
    const resetToken=user.getResetPasswordToken()
    await user.save({validateBeforeSave:false})

    const forgotPassword_Url=`${req.protocol}://${req.get("host")}/api/v1/users/password/reset/${resetToken}`;
    const message=`Your Password reset token is :- \n\n ${forgotPassword_Url} \n\n if you have not requested this email please ignore it`

    
    
    try {

        await sendEmail({
            email:user.email,
            subject:`E-LearningBackend Password Recovery`,
            message
        })

        res.status(200)
        .json(new apiResponse(200,{},`Email sent to ${user.email} Successfully`))
        
    } catch (error) {
        user.resetPasswordToken=undefined
        user.resetPasswrodExpire=undefined
        user.save({validateBeforeSave:false})
        throw new ApiError(500,error.message)
    }

})

// Reset Password
const resetPassword=asyncHandler(async(req,res)=>{

    // creating token hashed
    const resetPasswordToken=crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

    const user=await User.findOne({
        resetPasswordToken,
        resetPasswrodExpire:{$gt:Date.now()}
    })
    console.log("User is",user)

    if(!user){
        throw new ApiError(500,"Reset password token is invalid or has been expried")
    }

    if(req.body.password!==req.body.confirmPassword){
        throw new ApiError(400,"password does't not matched")
    }

    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswrodExpire=undefined

    await user.save()
    const tokens=await generateAceessAndRefreshToken(user._id)
    return res.
    status(200)
    .json(new apiResponse(200,{user,tokens},"password changed successfully"))


})

// Get user Details (personal)
const getProfileDetails=asyncHandler(async(req,res)=>{
     const user=await User.findById(req.params._id)
     if(!user){
        throw new ApiError(500,"User not found!")
     }

      user.resetPasswordToken=null
      user.resetPasswrodExpire=null

     return res.
     status(200)
     .json(new apiResponse(200,user,"User found Successfully"))

})

// update_password (personal)
const updatePassword=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.params._id).select("+password")
    
    let {newPassword,confirmPassword}=req.body

    const isPasswordMatched=await user.isPasswordCorrect(req.body.oldPassword)
    if(!isPasswordMatched){
        throw new ApiError(402,"password does't matched")
    }

    if(newPassword!==confirmPassword){
        throw new ApiError(500,"newPassword and confirmed password not same")
    }
     
   user.password=newPassword                      
                                                    
   await user.save()
   await generateAceessAndRefreshToken(user._id)
   
   const message="Your E-LearningBacken Password Changed Successfully"
   
   try {

    await sendEmail({
        email:user.email,
        subject:`E-LearningBackend Change Password`,
        message
    })

    return res
   .status(200)
   .json(new apiResponse(200,user,"password changed Successfully"))

} catch (error) {
    user.resetPasswordToken=undefined
    user.resetPasswrodExpire=undefined
    user.save({validateBeforeSave:false})
    throw new ApiError(500,error.message)
}
    
})

// update profile (personal)
const updateProfile=asyncHandler(async(req,res)=>{
    const {name,email,avatar,role}=req.body
    const user=await User.findById(req.params._id)
    if(!user){
        throw new ApiError(404,"User does't found")
    }

    user.name=name
    user.email=email
    user.avatar=avatar
    user.role=role
    
    await user.save()
    // await generateAceessAndRefreshToken(user._id)
    return res
    .status(200)
    .json(new apiResponse(200,{user},"profile update Successfully"))
})

// get all users (admin)
const get_users=asyncHandler(async(req,res)=>{
    const users=await User.find() 
    if(!users){
        throw new ApiError(404,"Users does't Found !")
    }

    return res
    .status(200)
    .json(new apiResponse(200,{users},"Users found Successfully"))

    
})

// get single user detials (admin)
const getUser=asyncHandler(async(req,res)=>{
     const user=await User.findById(req.params._id)
     if(!user){
        throw new ApiError(404,`user does't exist with Id:${req.params._id}`)
     }

     return res
     .status(200)
     .json(new apiResponse(200,user,"User found Successfully"))
})

// update user role (admin)
const updateSingleUseraRole=asyncHandler(async(req,res)=>{
   const user=await User.findByIdAndUpdate(req.params._id,
    {$set:{role:req.body.role}},
    {new:true}
    ) 
   if(!user){
    throw new ApiError(404,`user not exist with the Id:${req.params._id}`)
   }

   if (req.body.role !== "user" && req.body.role !== "admin") {
    throw new ApiError(500, "Please enter a valid role (user or admin)");
 }
    
   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(new apiResponse(200,user,"Role are updated Successfull"))

})

// delete users (admin) 
const delete_user=asyncHandler(async(req,res)=>{
    const user=await User.findByIdAndDelete(req.params._id)
    if(!user){
        throw new ApiError(404,`User not found this Id:${req.params._id}`)
    }

    return res
    .status(200)
    .json(new apiResponse(200,user,"user Deleted by admin Successfully"))

})


export {
    registerUsers,
    loginUser,
    logOutUser,
    forgotPassword,
    resetPassword,
    getProfileDetails,
    updatePassword,
    updateProfile,
    get_users,
    getUser,
    updateSingleUseraRole,
    delete_user
}