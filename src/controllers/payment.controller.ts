import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/api.Response";

import {
	getPaymentsFromLeaseId as getPaymentsFromLeaseIdService,
	getPaymentsFromLeaseIds as getPaymentsFromLeaseIdsService,
	getPaymentById as getPaymentByIdService,
} from "../services/payment.services";
import { IUser } from "../types/user.type";
import { getLeasesByQuery } from "../services/lease.services";

//---------------------------------Get Payments From Lease Id---------------------------------s
export const getPaymentsFromLeaseId = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params; // lease id

		const payments = await getPaymentsFromLeaseIdService(id);

		return res.status(200).json({
			success: true,
			message: "Payments fetched successfully",
			data: payments,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//---------------------------------Create Payment---------------------------------
export const createPayment = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//---------------------------------Get Payment By Id---------------------------------
export const getPaymentById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;

		const payment = await getPaymentByIdService(id);
		if (!payment) {
			return next(createError("Payment not found", 404));
		}

		return res.status(200).json({
			success: true,
			message: "Payment fetched successfully",
			data: payment,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//---------------------------------Get Payment History---------------------------------
export const getPaymentHistory = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;

		let query: any = {};
		if (user.role === "landlord") {
			query.landlord = user._id;
		} else {
			query.tenant = user._id;
		}

		const { page = 1, limit = 10 } = req.query;
		const skip = (Number(page) - 1) * Number(limit);

		//get leases by query
		const userLeases = await getLeasesByQuery(query);

		//if no leases found
		if (userLeases.length === 0) {
			return res.status(200).json({
				success: true,
				message: "No payment history found",
				data: [],
			});
		}

		//get lease ids to get payments
		const leaseIds = userLeases.map((lease) => lease._id);

		//get payments from lease ids
		const { payments, totalCount } = await getPaymentsFromLeaseIdsService(
			leaseIds,
			skip,
			Number(limit)
		);

		const totalPages = Math.ceil(totalCount / Number(limit));

		return res.status(200).json({
			success: true,
			message: "Payment history fetched successfully",
			data: {
				payments,
				totalPages,
				totalCount,
			},
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};
