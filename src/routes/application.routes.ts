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

//apply for property with property id by tenant
router.post("/apply/:id", authMiddleware(["tenant"]), applyForProperty as any);

//get all applications by tenant
router.get(
	"/get-all-applications",
	authMiddleware(["tenant"]),
	getAllApplications as any
);

//get application by application id by tenant
router.get(
	"/get-application/:id",
	authMiddleware(["tenant"]),
	getApplicationById as any
);

//update application by application id by landlord (approve or reject)
router.put(
	"/update-application/:id",
	authMiddleware(["landlord"]),
	updateApplication as any
);

export default router;
