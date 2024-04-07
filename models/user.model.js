import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import validator from "validator"
import  Jwt  from "jsonwebtoken"
import crypto from "crypto"
const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,"Please Enter name"],
            maxLength:[30,"name can not exceed 30 characters"],
            minLength:[4,"name should have more then 4 characters"]
            
        },
        email:{
            type:String,
            required:[true,"Please Enter email"],
            unique:true,
            validate:[validator.isEmail,"Please Enter valid Email"]
        },
        password:{
            type:String,
            required:[true,"Please Enter Password"],
            select:false,
        },
        avatar:{
           
              public_id:{
                type:String,
                required:true
              },
              url:{
                type:String,
                required:true
              }
        },

        role:{
            type:String,
            default:"user"
        },
        resetPasswordToken:String,
        resetPasswrodExpire:Date
    }
    ,{timestamps:true}
    )
    
    // Hash Password
    userSchema.pre("save", async function (next){
        if(!this.isModified("password")) return next()
        this.password= await bcrypt.hash(this.password, 10)
        next()
    });
    
    // compaire Password
    userSchema.methods.isPasswordCorrect=async function(password){
      return await bcrypt.compare(password,this.password);
     
    }

    // Generating Password Reset Token
    userSchema.methods.getResetPasswordToken=function(){
        // generating token
       const resetToken=crypto.randomBytes(20).toString("hex")

       // Hashing and add to userSchema
       this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex")
       
       // expireing token
       this.resetPasswrodExpire=Date.now()+15*60*1000
       return resetToken

    }
     

    // provide AccessToken
     userSchema.methods.generateAccessToken=function(){
       return Jwt.sign(
            {
                _id:this._id
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn:process.env.ACCESS_TOKEN_EXPIRE
            }
        )
       
     }
     
    // provide RefreshToken
    userSchema.methods.generateRefreshToken=function(){
       return Jwt.sign(
            {
                _id:this._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn:process.env.REFRESH_TOKEN_EXPIRE
            }
        )
    }

    export const User=mongoose.model("User",userSchema)