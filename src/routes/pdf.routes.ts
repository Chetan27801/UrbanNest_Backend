import express from "express";
import { generateLeaseAgreementPDF } from "../controllers/pdf.controller";
import authMiddleware from "./../middleware/auth.middleware";

const router = express.Router();

// Generate and download PDF directly
router.get(
	"/lease/:leaseId/agreement/download",
	authMiddleware(["tenant", "landlord"]),
	generateLeaseAgreementPDF as any
);

export default router;
