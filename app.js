import express from "express"
import cookieParser from "cookie-parser"

const app=express()

app.use(express.json())

app.use(cookieParser())



// import user routes
import userRouter from "./routes/user.Routes.js"
app.use("/api/v1/users/",userRouter)

// import Course routes 
import courseRouter from  "./routes/course.Routes.js"
app.use("/api/v1/course/",courseRouter)


export {app}