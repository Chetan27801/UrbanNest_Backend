import { Router } from "express";

//Controllers
import {
	register,
	login,
	googleAuth,
	googleAuthCallback,
	forgotPassword,
	resetPassword,
	verifyEmail,
	isEmailVerified,
} from "../controllers/auth.controller";

//middleware
import { validateBody } from "../middleware/validation.middleware";

//schema
import { registerSchema, loginSchema } from "../schema/user.schema";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

//TODO: add email sending features

//--------------------------------Routes--------------------------------

//register new user
router.post("/register", validateBody(registerSchema), register as any);

//login user
router.post("/login", validateBody(loginSchema), login as any);

//forgot password and send reset password email
router.post("/forgot-password", forgotPassword as any);

//reset password
router.post("/reset-password", resetPassword as any);

//send verification email
router.post(
	"/verify-email-send",
	authMiddleware(["admin", "tenant", "landlord"]),
	verifyEmail as any
);

//verify email
router.post("/verify-email", isEmailVerified as any);

//google auth
router.get("/google", googleAuth as any);
router.get("/google/callback", googleAuthCallback as any);

export default router;
