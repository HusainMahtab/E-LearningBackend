import {Router} from "express"

import { 
    createCourse,
    update_courese,
    delete_course,
    getAllCourse,
    getCourseDetails,
    create_course_review,
    getCourseReview,
    deleteReviews 
} from "../controllers/course.controllers.js"

import {isAuthenticatedUser,authorizeRole} from "../middlewares/auth.middleware.js"
const router=Router()

// create Courese ---Admin
router.route("/create_course").post(isAuthenticatedUser,authorizeRole("admin"),createCourse)

// update Courese   ---Admin
router.route("/update_course/:_id").post(isAuthenticatedUser,authorizeRole("admin"),update_courese)

// delete Courese    --Admin
router.route("/delete_course/:_id").delete(isAuthenticatedUser,authorizeRole("admin"),delete_course)

// Get All Course   ---users
router.route("/all_course").get(getAllCourse)

// get courseDetails   --users
router.route("/course_details/:_id").get( getCourseDetails )

// give reviews ---users
router.route("/create_reviews").put(isAuthenticatedUser,create_course_review)

// get course reviews  ---users
router.route("/get_reviews").get(isAuthenticatedUser,getCourseReview)

// delete reviews  ---users
router.route("/delete_review").delete(isAuthenticatedUser,deleteReviews)

export default router

