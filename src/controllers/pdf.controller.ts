import { NextFunction, Request, Response } from "express";
import { createError } from "../utils/api.Response";
import { getLeaseById as getLeaseByIdService } from "../services/lease.services";
import { PDFService } from "../services/pdf.services";

export const generateLeaseAgreementPDF = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { leaseId } = req.params;
		const lease = await getLeaseByIdService(leaseId);
		if (!lease) {
			return next(createError("Lease not found", 404));
		}
		const pdfBuffer = await PDFService.generateLeaseAgreementPDF(lease);

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="lease-agreement.pdf"`
		);
		res.send(pdfBuffer);
	} catch (error) {
		next(createError("Internal server error", 500, String(error)));
	}
};
