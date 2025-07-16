import { Schema, model } from "mongoose";
import { IApplication } from "../types/application.type";
import { getEnumValues, ApplicationStatus } from "../types/enums";

const applicationSchema = new Schema<IApplication>(
	{
		applicationDate: {
			type: Date,
			default: Date.now,
		},
		status: {
			type: String,
			enum: {
				values: getEnumValues(ApplicationStatus),
				message: "Invalid application status",
			},
			default: ApplicationStatus.Pending,
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
		applicantName: {
			type: String,
			required: [true, "Applicant name is required"],
			trim: true,
		},
		applicantEmail: {
			type: String,
			required: [true, "Applicant email is required"],
			trim: true,
			lowercase: true,
		},
		applicantPhone: {
			type: String,
			required: [true, "Applicant phone is required"],
			trim: true,
		},
		message: {
			type: String,
			trim: true,
			maxlength: [1000, "Message cannot exceed 1000 characters"],
		},
		lease: {
			type: Schema.Types.ObjectId,
			ref: "Lease",
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Indexes
applicationSchema.index({ property: 1 });
applicationSchema.index({ tenant: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ applicationDate: -1 });

// Ensure only one application per tenant per property
applicationSchema.index({ property: 1, tenant: 1 }, { unique: true });

const Application = model<IApplication>("Application", applicationSchema);

export default Application;
