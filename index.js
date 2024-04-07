import { app } from "./app.js";
import { connection } from "./db/DB_connection.js";
import dotenv from "dotenv";
dotenv.config({ path:"./.env" });

connection()
.then(()=>{
    app.on("error:",(error)=>{
        console.log("error while Listing App")
        throw error
    }) 

   app.listen(process.env.PORT || 6000,()=>{
    console.log(`App is Live on:${process.env.PORT}`)
   })
    
})
.catch((error)=>{
    console.log("DB connection Faild !!",error)
})



