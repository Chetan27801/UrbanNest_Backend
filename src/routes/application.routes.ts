import { Router } from "express";
import {
	applyForProperty,
	getAllApplications,
	getApplicationById,
	updateApplication,
} from "../controllers/application.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

//--------------------------------Routes--------------------------------

router.post("/apply/:id", authMiddleware(["tenant"]), applyForProperty as any);

router.get(
	"/get-all-applications",
	authMiddleware(["tenant"]),
	getAllApplications as any
);

router.get(
	"/get-application/:id",
	authMiddleware(["tenant"]),
	getApplicationById as any
);

router.put(
	"/update-application/:id",
	authMiddleware(["landlord"]),
	updateApplication as any
);

export default router;
