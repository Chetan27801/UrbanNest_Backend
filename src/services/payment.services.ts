import Payment from "../models/Payment.model";

const getPaymentsFromLeaseId = async (leaseId: string) => {
	const payments = await Payment.find({ lease: leaseId }).populate(
		"lease",
		"property"
	);
	return payments;
};

const getPaymentById = async (id: string) => {
	const payment = await Payment.findById(id).populate("lease", "property");
	return payment;
};

const getPaymentsFromLeaseIds = async (
	leaseIds: string[],
	skip: number,
	limit: number
) => {
	const [payments, totalCount] = await Promise.all([
		Payment.find({
			lease: { $in: leaseIds },
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
		}),
	]);

	return { payments, totalCount };
};

export { getPaymentsFromLeaseId, getPaymentById, getPaymentsFromLeaseIds };
