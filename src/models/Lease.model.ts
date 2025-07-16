import { Schema, model } from "mongoose";
import { ILease } from "../types/lease.type";

const leaseSchema = new Schema<ILease>(
	{
		startDate: {
			type: Date,
			required: [true, "Start date is required"],
		},
		endDate: {
			type: Date,
			required: [true, "End date is required"],
			validate: {
				validator: function (this: ILease, value: Date) {
					return value > this.startDate;
				},
				message: "End date must be after start date",
			},
		},
		rent: {
			type: Number,
			required: [true, "Rent amount is required"],
			min: [0, "Rent cannot be negative"],
		},
		deposit: {
			type: Number,
			required: [true, "Deposit amount is required"],
			min: [0, "Deposit cannot be negative"],
		},
		property: {
			type: Schema.Types.ObjectId,
			ref: "Property",
			required: [true, "Property is required"],
		},
		tenant: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Tenant is required"],
		},
		application: {
			type: Schema.Types.ObjectId,
			ref: "Application",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Indexes
leaseSchema.index({ property: 1 });
leaseSchema.index({ tenant: 1 });
leaseSchema.index({ startDate: 1, endDate: 1 });
leaseSchema.index({ isActive: 1 });

// Virtual for payments
leaseSchema.virtual("payments", {
	ref: "Payment",
	localField: "_id",
	foreignField: "lease",
});

leaseSchema.set("toJSON", { virtuals: true });
leaseSchema.set("toObject", { virtuals: true });

const Lease = model<ILease>("Lease", leaseSchema);

export default Lease;
