import { Router } from "express";

//Controllers
import {
	register,
	login,
	googleAuth,
	googleAuthCallback,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register as any);
router.post("/login", login as any);
router.get("/google", googleAuth as any);
router.get("/google/callback", googleAuthCallback as any);

export default router;
