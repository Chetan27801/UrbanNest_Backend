import { Router } from "express";
import {
	applyForProperty,
	getAllApplications,
	getAllApplicationsByLandlord,
	getApplicationById,
	updateApplication,
	checkApplicationStatus,
} from "../controllers/application.controller";
import authMiddleware from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validation.middleware";
import { updateApplicationSchema } from "../schema/application.schema";

const router = Router();

//--------------------------------Routes--------------------------------

//apply for property with property id by tenant
router.post("/apply/:id", authMiddleware(["tenant"]), applyForProperty as any);

//check if tenant has applied for property
router.get(
	"/check-status/:propertyId",
	authMiddleware(["tenant"]),
	checkApplicationStatus as any
);

//get all applications by tenant
router.get(
	"/get-all-applications",
	authMiddleware(["tenant"]),
	getAllApplications as any
);

//get all applications by landlord
router.get(
	"/get-all-applications-by-landlord/:status",
	authMiddleware(["landlord"]),
	getAllApplicationsByLandlord as any
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
	validateBody(updateApplicationSchema),
	updateApplication as any
);

export default router;
