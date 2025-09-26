import Payment from "../models/Payment.model";
import { PaymentStatus, getEnumValues } from "../types/enums";
import { ICreatePayment } from "../types/payment.type";

const getPaymentsFromLeaseId = async (
	leaseId: string,
	page: number,
	limit: number,
	status: string
) => {
	const skip = (page - 1) * limit;
	const statusFilter =
		status === "all" ? { $in: getEnumValues(PaymentStatus) } : status;
	const [payments, totalCount] = await Promise.all([
		Payment.find({ lease: leaseId, paymentStatus: statusFilter })
			.skip(skip)
			.limit(limit)
			.populate("lease", "property"),
		Payment.countDocuments({ lease: leaseId, paymentStatus: statusFilter }),
	]);

	const totalPages = Math.ceil(totalCount / limit);
	const hasNextPage = page < totalPages;
	const hasPreviousPage = page > 1;

	return {
		payments,
		pagination: {
			page,
			limit,
			totalPages,
			hasNextPage,
			hasPreviousPage,
			totalItems: totalCount,
		},
	};
};

const getPaymentById = async (id: string) => {
	const payment = await Payment.findById(id).populate("lease", "property");
	return payment;
};

const getPaymentsFromLeaseIds = async (
	leaseIds: string[],
	page: number,
	limit: number,
	status: string,
	id: string
) => {
	const skip = (page - 1) * limit;
	const [payments, totalCount] = await Promise.all([
		Payment.find({
			lease: { $in: leaseIds },
			status: status === "all" ? { $in: getEnumValues(PaymentStatus) } : status,
		})
			.sort({ paymentDate: -1, dueDate: -1 })
			.populate({
				path: "lease",
				select: "property",
				populate: {
					path: "property",
					select: "name photoUrls",
				},
			})
			.skip(skip)
			.limit(limit),
		Payment.countDocuments({
			lease: { $in: leaseIds },
			status: status === "all" ? { $in: getEnumValues(PaymentStatus) } : status,
		}),
	]);

	const totalPages = Math.ceil(totalCount / limit);
	const hasNextPage = page < totalPages;
	const hasPreviousPage = page > 1;

	return {
		payments,
		pagination: {
			page,
			limit,
			totalPages,
			totalCount,
			hasNextPage,
			hasPreviousPage,
		},
	};
};

const generateRecurringPayments = async (
	leaseId: string,
	rent: number,
	startDate: Date,
	endDate: Date
) => {
	const payments = [];
	const start = new Date(startDate);
	const end = new Date(endDate);

	//generate monthly payments
	let currentDate = new Date(start);
	currentDate.setDate(5); //due on 5th of each month
	currentDate.setMonth(currentDate.getMonth() + 1);

	while (currentDate <= end) {
		const payment = new Payment({
			amountDue: rent,
			dueDate: currentDate,
			lease: leaseId,
			paymentType: "rent",
			currency: "USD",
			paymentStatus: PaymentStatus.Pending,
		});
		const savedPayment = await payment.save();
		payments.push(savedPayment);

		//Move to next month
		currentDate.setMonth(currentDate.getMonth() + 1);
	}

	return payments;
};

const createPaymentRecord = async (paymentData: ICreatePayment) => {
	const payment = new Payment(paymentData);
	return await payment.save();
};

export const markPaymentAsOverdue = async () => {
	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	try {
		const overduePayment = await Payment.updateMany(
			{
				paymentStatus: PaymentStatus.Pending,
				dueDate: { $lt: currentDate },
			},
			{
				$set: {
					paymentStatus: PaymentStatus.Overdue,
					updatedAt: new Date(),
				},
			}
		);

		return overduePayment.modifiedCount;
	} catch (error) {
		throw new Error("Failed to mark payment as overdue");
	}
};

export {
	getPaymentsFromLeaseId,
	getPaymentById,
	getPaymentsFromLeaseIds,
	generateRecurringPayments,
	createPaymentRecord,
};
