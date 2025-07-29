import { Router } from "express";
import { loginUser, registerUser, logOutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// public routes
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(
    loginUser
);

router.route("/refresh-token").post(
    refreshAccessToken
);



// secured routes
router.route("/logout").post(
    verifyJWT,
    logOutUser
);
router.route("/change-password").post(
    verifyJWT,
    changeCurrentPassword
);
router.route("/current-user").get(
    verifyJWT,
    getCurrentUser
);
router.route("/update-account").put(
    verifyJWT,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    updateAccountDetails
);
router.route("/update-avatar").put(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
);
router.route("/update-cover-image").put(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);


export default router;