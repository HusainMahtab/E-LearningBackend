import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken"

const isAuthenticatedUser=asyncHandler(async(req,res,next)=>{
     try {
        const token=req.cookies?.accessToken || req.header("Authorization") ?.replace("Brerer ", "")
      //   console.log(req.cookies)
      //   console.log(token)
        if(!token){
           throw new ApiError(401,"Please login to access the resource")
        }
   
        const decodedToken=Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        req.user=await User.findById(decodedToken._id)
   
        next()
     } catch (error) {
         throw new ApiError(500,error?.message || "Invalid AccessToken !")
     }

})

const authorizeRole =(...roles)=>{
   return (req,res,next)=>{
      if(!roles.includes(req.user.role)){
          throw new ApiError(403,`Role:${req.user.role} is not allowed to access this resource`)
      }
      next()
   }
}

export {isAuthenticatedUser,authorizeRole}