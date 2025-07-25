import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
	createPayment,
	getPaymentsFromLeaseId,
	getPaymentById,
	getPaymentHistory,
} from "../controllers/payment.controller";

const router = Router();

//--------------------------------Routes--------------------------------

//get payments from lease id
router.get(
	"/get-payments/lease/:id",
	authMiddleware(["landlord, tenant"]),
	getPaymentsFromLeaseId as any
);

//TODO: Process a payment for a specific paymentId (e.g., from a payment gateway webhook).
router.post(
	"/create-payment",
	authMiddleware(["landlord"]),
	createPayment as any
);

//get payment by payment id
router.get(
	"/get-payment/:id",
	authMiddleware(["landlord, tenant"]),
	getPaymentById as any
);

//get payment history for landlord or tenant
router.get(
	"/get-payment-history",
	authMiddleware(["landlord, tenant"]),
	getPaymentHistory as any
);

export default router;
