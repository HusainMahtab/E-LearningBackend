import { Course } from "../models/course.mode.js";
import { ApiError } from "../utils/apiError.js";
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Apifeatures} from "../utils/apifeatures.js"

// create course  ----Admin
const createCourse=asyncHandler(async(req,res)=>{
    const {
        title,
        description,
        categoury,
        lavel,
        duration,
        modules,
        quizzes,
        assignments,
        price,
        reviews,
    }=req.body

    if(title===""){
       throw new ApiError(409,"title is required ")
    }else if(description===""){
       throw new ApiError(409,"description is required ")
    }else if(categoury===""){
       throw new ApiError(409,"categoury is required ")
    }else if(lavel===""){
       throw new ApiError(409,"lavel is required ")
    }else if(price===""){
       throw new ApiError(409,"price is required ")
    }else if(duration===""){
       throw new ApiError(409,"duration is required ")
    }


    const course=await Course.create({
        title,
        description,
        categoury,
        lavel,
        duration,
        modules,
        quizzes,
        assignments,
        price,
        reviews
    })

    if(!course){
        throw new ApiError(500,"Course does't created")
    }

    return res
    .status(200)
    .json(new apiResponse(200,course,"Course Created Successfully"))

})

// update course   ---Admin
const update_courese=asyncHandler(async(req,res)=>{
    const course=await Course.findById(req.params._id)
    if(!course){
        throw new ApiError(404,"Course is not found !")
    }

      const {
        title, 
        description, 
        categoury, 
        lavel, 
        duration, 
        modules, 
        quizzes, 
        assignments,
        price, 
        reviews
        }=req.body

       if(title===""){
          throw new ApiError(409,"title is required ")
       }else if(description===""){
          throw new ApiError(409,"description is required ")  
       }else if(categoury===""){
          throw new ApiError(409,"cateroury is required ")
       }else if(lavel===""){
          throw new ApiError(409,"lavel is required ")
       }else if(duration===""){
          throw new ApiError(409,"duration is required ")
       }else if(price===""){
          throw new ApiError(409,"price is required ")
       }

     const updated_course=await Course.findByIdAndUpdate(req.params._id,req.body,

        {
            new:true,
            $set:[{title},{description},{categoury},{lavel},{duration},{modules},{quizzes},{assignments},{reviews},{price}]
        }

        )
    
        if(!updated_course){
            throw new ApiError(500,"Course does't Updated")
        }

        return res
        .status(200)
        .json(new apiResponse(200,updated_course,"Course updated Successfully"))


}) 

// delete course    ---Admin
const delete_course=asyncHandler(async(req,res)=>{
    const course=await Course.findByIdAndDelete(req.params._id)

    if(!course){
        throw new ApiError(404,"Course does't found")
    }

    return res
    .status(200)
    .json(new apiResponse(200,course,`Course Deleted Successfully this Id:${req.params._id}`))
})


// get All course  
    const getAllCourse=asyncHandler(async(req,res,)=>{

        const resultPerPage=5;
        const coursetCount=await Course.countDocuments()
        
        const apiFeatures=new Apifeatures(Course.find(),req.query).search().filter().pagination(resultPerPage)
        
        const allCourse=await apiFeatures.query
    
        if(!allCourse){
            throw new ApiError(404,"product not found")
        }
    
         return res
         .status(200)
         .json(new apiResponse(200,{allCourse,coursetCount},"Success"))
    })


// get single courseDetails
const getCourseDetails=asyncHandler(async(req,res)=>{
    const course=await Course.findById(req.params._id)

    if(!course){
        throw new ApiError(404,`Course not found this Id:${req.params._id}`)
    }

    return res
    .status(200)
    .json(new apiResponse(200,course,"Course found successfully"))
})

//  create Course Reviews
const create_course_review=asyncHandler(async(req,res)=>{
    const {courseId,rating,comment}=req.body

    console.log(courseId)

    const reviews={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }

    try {
        const course=await Course.findById(courseId)

        console.log(course)

        const isReviewed=course.reviews.find(rev=>rev.user.toString()===req.user._id.toString())

        if(isReviewed){
            course.reviews.forEach(rev=>{
                if(rev.user.toString()===req.user._id.toString()){
                    rev.rating=rating;
                    rev.comment=comment;
                }
            })
        }else{
            course.reviews.push(reviews)
        }

        let avgRatings=0

        course.reviews.forEach(rev=>{
            avgRatings+=rev.rating
        })

        course.ratings=avgRatings/course.reviews.length

        await course.save({validateBeforeSave:false})

        return res
        .status(200)
        .json(new apiResponse(200,{},"Reviews Submitted Successfully"))
    } catch (error) {
        console.error(error);
        return res.status(500).json(new apiResponse(500, null, "Internal Server Error"));
    }
})

// get course Reviews
const getCourseReview=asyncHandler(async(req,res)=>{
    const course=await Course.findById(req.query._id)

    if(!course){
        throw new ApiError(404,`Course is not found this Id:${req.query._id}`)
    }

    return res
    .status(200)
    .json(new apiResponse(200,{reviews:course.reviews},"Get Course Reviews Successfully"))

})

// delete reviews
const deleteReviews=asyncHandler(async(req,res)=>{
    const course=await Course.findById(req.query.courseId)

    console.log("course",course)
    if(!course){
        throw new ApiError(404,`Course does't found this Id:${req.query.courseId}`)
    }

    const reviews=course.reviews.filter((rev)=>rev._id.toString()!==req.query._id.toString())

    if(!reviews){
        throw new ApiError(404,"reviews does not found")
    }

    let avgRatings=0

    reviews.forEach((rev)=>{
        avgRatings+=rev.rating
    })

    const ratings=avgRatings/reviews.length

    await Course.findByIdAndUpdate(req.query.courseId,
        {
            reviews,
            ratings
        },
        {
            new:true,
            runValidators:true,
            useFindAndModify:false
        }
        )

        return res
        .status(200)
        .json(new apiResponse(200,{},"Review Deleted Successfully"))


})

export {
    createCourse,
    update_courese,
    delete_course, 
    getAllCourse,
    getCourseDetails,
    create_course_review,
    getCourseReview,
    deleteReviews
}
