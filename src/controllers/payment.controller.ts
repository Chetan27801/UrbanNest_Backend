import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/api.Response";

import {
	getPaymentsFromLeaseId as getPaymentsFromLeaseIdService,
	getPaymentsFromLeaseIds as getPaymentsFromLeaseIdsService,
	getPaymentById as getPaymentByIdService,
} from "../services/payment.services";

import {
	createPayPalOrder,
	capturePayPalOrder,
} from "../services/paypal.services";
import { IUser } from "../types/user.type";
import { getLeasesByQuery } from "../services/lease.services";
import { PaymentStatus } from "../types/enums";

//---------------------------------Get Payments From Lease Id---------------------------------s
export const getPaymentsFromLeaseId = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { status = "all", id } = req.params; // lease id
		const { page = 1, limit = 10 } = req.query;

		const payments = await getPaymentsFromLeaseIdService(
			id,
			Number(page),
			Number(limit),
			status
		);

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

//using the payment id to create the payment order from paypal and return the order id and approval url
//using this order id and approval url to redirect the user to the paypal payment page
export const createPaymentOrder = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { paymentId, description = `Payment for Rent ${paymentId}` } =
			req.body;

		//get payment details
		const payment = await getPaymentByIdService(paymentId);
		if (!payment) {
			return next(createError("Payment not found", 404));
		}

		// Add timestamp to prevent caching
		const timestamp = Date.now();
		const paypalOrder = await createPayPalOrder({
			amount: payment.amountDue,
			currency: process.env.PAYPAL_CURRENCY || "USD",
			description: description,
			returnUrl: `${process.env.FRONTEND_URL}payment/success?paymentId=${paymentId}&t=${timestamp}`,
			cancelUrl: `${process.env.FRONTEND_URL}payment/cancel?paymentId=${paymentId}&t=${timestamp}`,
		});

		payment.paypalOrderId = paypalOrder.result.id;
		payment.paymentMethod = "paypal";
		await payment.save();

		return res.status(200).json({
			success: true,
			message: "Order created successfully",
			data: {
				orderId: paypalOrder.result.id,
				approvalUrl: paypalOrder.result.links?.find(
					(link) => link.rel === "approve"
				)?.href,
				payment,
			},
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//---------------------------------Capture Payment---------------------------------
//using the payment id and order id to capture the payment from paypal and update the payment details
export const capturePaymentOrder = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { paymentId, orderId } = req.body;
		console.log("=====================================");
		console.log(paymentId, orderId);
		console.log("=====================================");

		//get payment details
		const payment = await getPaymentByIdService(paymentId);
		if (!payment) {
			return next(createError("Payment not found", 404));
		}

		if (payment.paypalOrderId !== orderId) {
			return next(createError("Invalid order id", 400));
		}

		// Check if payment is already captured
		if (payment.paymentStatus === PaymentStatus.Paid) {
			return res.status(200).json({
				success: true,
				message: "Payment already captured",
				data: payment,
			});
		}

		//capture payment
		const capture = await capturePayPalOrder(orderId);

		console.log("=====================================");
		console.log("PayPal Capture Response:", capture);
		console.log("=====================================");

		// Extract payment details from PayPal response
		const captureDetails =
			capture.result.purchaseUnits?.[0]?.payments?.captures?.[0];
		const paidAmount = captureDetails?.amount?.value
			? parseFloat(captureDetails.amount.value)
			: payment.amountDue;

		//update payment with capture details
		payment.paymentStatus = PaymentStatus.Paid;
		payment.paymentDate = new Date();
		payment.transactionId = capture.result.id;
		payment.amountPaid = paidAmount; // Set the actual amount paid
		payment.paypalOrderId = orderId; // Ensure PayPal order ID is set
		payment.payPalPayerEmail = capture.result.payer?.emailAddress;
		await payment.save();

		console.log("=====================================");
		console.log(payment);
		console.log("=====================================");

		return res.status(200).json({
			success: true,
			message: "Payment Done successfully",
			data: payment,
			capture,
		});
	} catch (error: any) {
		console.log("===!!!!!!!!!!!!!!!!!!!!!!!!!");
		console.error("PayPal Capture Order Error:", error);
		console.log("===!!!!!!!!!!!!!!!!!!!!!!!!!");

		// Handle specific PayPal errors
		if (
			error.statusCode === 422 &&
			error.result?.details?.[0]?.issue === "ORDER_ALREADY_CAPTURED"
		) {
			// If order is already captured, check our database
			const payment = await getPaymentByIdService(req.body.paymentId);
			if (payment && payment.paymentStatus === PaymentStatus.Paid) {
				return res.status(200).json({
					success: true,
					message: "Payment already captured",
					data: payment,
				});
			}
		}

		// Log the error details for debugging
		if (error.result) {
			console.error("PayPal API Error Details:", error.result);
		}

		return next(
			createError(
				"PayPal API Error: " + (error.message || "Unknown error"),
				error.statusCode || 500,
				String(error)
			)
		);
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
		const { status = "all", id } = req.params;
		const user = req.user as IUser;

		let query: any = {};
		if (user.role === "landlord") {
			query.landlord = user._id;
		} else {
			query.tenant = user._id;
		}

		const { page = 1, limit = 10 } = req.query;

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
		const { payments, pagination } = await getPaymentsFromLeaseIdsService(
			leaseIds,
			Number(limit),
			Number(page),
			status,
			id
		);

		return res.status(200).json({
			success: true,
			message: "Payment history fetched successfully",
			data: {
				payments,
				pagination,
			},
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};
