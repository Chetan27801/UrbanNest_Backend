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

//Routes
router.post("/create-lease", authMiddleware(["landlord"]), createLease as any);
router.get(
	"/all-leases",
	authMiddleware(["landlord, tenant"]),
	getAllLease as any
);

router.get(
	"/get-lease/:id",
	authMiddleware(["landlord, tenant"]),
	getLeaseById as any
);
export default router;

router.put(
	"/terminate-lease/:id",
	authMiddleware(["landlord"]),
	terminateLease as any
);
