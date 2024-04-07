import mongoose from "mongoose"


const connection=async()=>{
    try {
        const response=await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_NAME}`);
        console.log("Data_base Connected Successfully.",)
    } catch (error) {
        console.error("Error:While connecting Data_base",error)
    }
}


export {connection}