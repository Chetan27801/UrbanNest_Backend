import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
	getAdminOverview,
	getAllUsers,
	getTenantOverview,
	verifyLandlord,
	getTenantPayments,
	getLandlordOverview,
	getLandlordFinancials,
	getPropertyDataForHome,
	getTotalPayments,
} from "../controllers/stats.controller";

const router = Router();

//admin stats

router.get(
	"/admin/overview",
	authMiddleware(["admin"]),
	getAdminOverview as any
);

router.get("/admin/users", authMiddleware(["admin"]), getAllUsers as any);

router.put(
	"/admin/verify-landlord/:id",
	authMiddleware(["admin"]),
	verifyLandlord as any
);

//landload stats
router.get(
	"/landlord/overview",
	authMiddleware(["landlord"]),
	getLandlordOverview as any
);

router.get(
	"/landlord/financials",
	authMiddleware(["landlord"]),
	getLandlordFinancials as any
);

router.get(
	"/total-payments",
	authMiddleware(["landlord"]),
	getTotalPayments as any
);

//tenant stats

router.get(
	"/tenant/overview",
	authMiddleware(["tenant"]),
	getTenantOverview as any
);
router.get(
	"/tenant/payments",
	authMiddleware(["tenant"]),
	getTenantPayments as any
);

//property data for home page
router.get("/property/data-for-home/:type", getPropertyDataForHome as any);

export default router;
