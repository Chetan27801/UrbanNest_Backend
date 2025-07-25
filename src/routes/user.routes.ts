import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
	deleteProfile,
	getProfile,
	updateProfile,
	getAllUsers,
	getUserById,
} from "../controllers/user.controller";

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

export default router;
