import { z } from "zod";
import { getEnumValues, ApplicationStatus } from "../types/enums";

export const updateApplicationSchema = z.object({
	status: z.enum(getEnumValues(ApplicationStatus) as [string, ...string[]], {
		errorMap: () => ({
			message: "Status must be 'Pending', 'Approved', or 'Rejected'",
		}),
	}),
	leaseDetails: z
		.object({
			startDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			endDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			rent: z.number().positive("Rent must be a positive number"),
			deposit: z.number().positive("Deposit must be a positive number"),
		})
		.optional(),
});

export const createApplicationSchema = z.object({
	message: z
		.string()
		.min(1, "Message is required")
		.max(1000, "Message cannot exceed 1000 characters")
		.trim()
		.optional(),
});

export type UpdateApplicationType = z.infer<typeof updateApplicationSchema>;
export type CreateApplicationType = z.infer<typeof createApplicationSchema>;
