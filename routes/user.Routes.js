import {Router} from "express"
import {
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
} from "../controllers/user.controller.js"
import {isAuthenticatedUser,authorizeRole} from "../middlewares/auth.middleware.js"

const router=Router()

router.route("/register").post(registerUsers)

router.route("/login").post(loginUser)

router.route("/logout").post(isAuthenticatedUser,logOutUser)

router.route("/password/forgot").post(forgotPassword)

router.route("/password/reset/:token").put(resetPassword)

router.route("/profile_details/:_id").get(isAuthenticatedUser,getProfileDetails)

router.route("/update_password/:_id").post(isAuthenticatedUser,updatePassword)

router.route("/update_profile/:_id").put(isAuthenticatedUser,updateProfile)

// for admin
router.route("/admin/get_alluser").get(isAuthenticatedUser,authorizeRole("admin"),get_users)

router.route("/admin/getUser/:_id").get(isAuthenticatedUser,authorizeRole("admin"),getUser)

router.route("/admin/update_role/:_id").put(isAuthenticatedUser,authorizeRole("admin"),updateSingleUseraRole)

router.route("/admin/delele_user/:_id").delete(isAuthenticatedUser,authorizeRole("admin"),delete_user)

export default router
