import { Router } from "express";

//Controllers
import {
	createLease,
	getAllLease,
	getLeaseById,
	terminateLease,
} from "../controllers/lease.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

//--------------------------------Routes--------------------------------

//create lease by landlord
router.post("/create-lease", authMiddleware(["landlord"]), createLease as any);

//get all leases by landlord or tenant
router.get(
	"/all-leases",
	authMiddleware(["landlord, tenant"]),
	getAllLease as any
);

//get lease by lease id
router.get(
	"/get-lease/:id",
	authMiddleware(["landlord, tenant"]),
	getLeaseById as any
);

//terminate lease by landlord
router.put(
	"/terminate-lease/:id",
	authMiddleware(["landlord"]),
	terminateLease as any
);

export default router;
