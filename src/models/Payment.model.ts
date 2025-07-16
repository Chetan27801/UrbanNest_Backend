// backend/src/models/Payment.model.ts
import { Schema, model } from "mongoose";
import { IPayment } from "../types/payment.type";
import { getEnumValues, PaymentStatus } from "../types/enums";

const paymentSchema = new Schema<IPayment>(
	{
		amountDue: {
			type: Number,
			required: [true, "Amount due is required"],
			min: [0, "Amount due cannot be negative"],
		},
		amountPaid: {
			type: Number,
			default: 0,
			min: [0, "Amount paid cannot be negative"],
		},
		dueDate: {
			type: Date,
			required: [true, "Due date is required"],
		},
		paymentDate: {
			type: Date,
		},
		paymentStatus: {
			type: String,
			enum: {
				values: getEnumValues(PaymentStatus),
				message: "Invalid payment status",
			},
			default: PaymentStatus.Pending,
		},
		lease: {
			type: Schema.Types.ObjectId,
			ref: "Lease",
			required: [true, "Lease is required"],
		},
		paymentMethod: {
			type: String,
			trim: true,
		},
		transactionId: {
			type: String,
			trim: true,
		},
		notes: {
			type: String,
			trim: true,
			maxlength: [500, "Notes cannot exceed 500 characters"],
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Indexes
paymentSchema.index({ lease: 1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ paymentDate: -1 });

// Pre-save middleware to update payment status based on amount paid
paymentSchema.pre("save", function (next) {
	if (this.amountPaid === 0) {
		this.paymentStatus = PaymentStatus.Pending;
	} else if (this.amountPaid >= this.amountDue) {
		this.paymentStatus = PaymentStatus.Paid;
		if (!this.paymentDate) {
			this.paymentDate = new Date();
		}
	} else {
		this.paymentStatus = PaymentStatus.PartiallyPaid;
	}

	// Check if payment is overdue
	if (
		this.paymentStatus === PaymentStatus.Pending &&
		new Date() > this.dueDate
	) {
		this.paymentStatus = PaymentStatus.Overdue;
	}

	next();
});

const Payment = model<IPayment>("Payment", paymentSchema);

export default Payment;
