import { Router } from "express";
import {
	createPresignedUrl,
	getMediaUrl,
} from "../controllers/media.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

// Debug route to test if media routes are working
router.get("/test", (req, res) => {
	res.json({ message: "Media routes are working!" });
});

router.get(
	"/media-url/:key(*)",
	authMiddleware(["admin", "tenant", "landlord"]),
	getMediaUrl as any
);
router.post(
	"/generate-presigned-url",
	authMiddleware(["admin", "tenant", "landlord"]),
	createPresignedUrl as any
);

export default router;
