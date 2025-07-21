import { Router } from "express";

//Controllers
import {
	register,
	login,
	googleAuth,
	googleAuthCallback,
} from "../controllers/auth.controller";

//middleware
import { validateBody } from "../middleware/validation.middleware";

//schema
import { registerSchema, loginSchema } from "../schema/user.schema";

const router = Router();

router.post("/register", validateBody(registerSchema), register as any);
router.post("/login", validateBody(loginSchema), login as any);

//TODO: Add validation middleware for google auth
router.get("/google", googleAuth as any);
router.get("/google/callback", googleAuthCallback as any);

export default router;
