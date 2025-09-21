import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
	createPaymentOrder,
	getPaymentsFromLeaseId,
	getPaymentById,
	getPaymentHistory,
	capturePaymentOrder,
} from "../controllers/payment.controller";

const router = Router();

//--------------------------------Routes--------------------------------

//get payments from lease id
router.get(
	"/get-payments/lease/:id/:status",
	authMiddleware(["landlord", "tenant"]),
	getPaymentsFromLeaseId as any
);

//create payment
router.post(
	"/create-payment",
	authMiddleware(["tenant"]),
	createPaymentOrder as any
);

//capture payment
router.post(
	"/capture-payment",
	authMiddleware(["tenant"]),
	capturePaymentOrder as any
);

//get payment by payment id
router.get(
	"/get-payment/:id",
	authMiddleware(["landlord, tenant"]),
	getPaymentById as any
);

//get payment history for landlord or tenant
router.get(
	"/get-payment-history/:id/:status",
	authMiddleware(["landlord, tenant"]),
	getPaymentHistory as any
);

export default router;
