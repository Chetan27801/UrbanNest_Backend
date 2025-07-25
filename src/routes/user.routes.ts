import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
	deleteProfile,
	getProfile,
	updateProfile,
	getAllUsers,
	getUserById,
	uploadAvatar,
	getAvatar,
	deleteAvatar,
} from "../controllers/user.controller";
import { uploadUserAvatar } from "../middleware/upload.middleware";

const router = Router();

//--------------------------------Routes--------------------------------

//get user's own profile
router.get(
	"/profile",
	authMiddleware(["admin", "tenant", "landlord"]),
	getProfile as any
);

//update user's own profile
router.put(
	"/update-profile",
	authMiddleware(["admin", "tenant", "landlord"]),
	updateProfile as any
);

//delete user's own profile
router.delete(
	"/delete-profile",
	authMiddleware(["admin", "tenant", "landlord"]),
	deleteProfile as any
);

//get all users
router.get("/all-users", authMiddleware(["admin"]), getAllUsers as any);

//get user by id
router.get("/user-by-id/:id", authMiddleware(["admin"]), getUserById as any);

//-------------User media-------------

//upload user avatar
router.post(
	"/upload-avatar",
	authMiddleware(["admin", "tenant", "landlord"]),
	uploadUserAvatar.single("avatar"),
	uploadAvatar as any
);

//get user avatar
router.get(
	"/get-avatar",
	authMiddleware(["admin", "tenant", "landlord"]),
	getAvatar as any
);

//delete user avatar
router.delete(
	"/delete-avatar",
	authMiddleware(["admin", "tenant", "landlord"]),
	deleteAvatar as any
);

export default router;
