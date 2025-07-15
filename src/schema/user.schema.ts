import { z } from "zod";

//user register schema
export const registerSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Name cannot exceed 100 characters")
		.trim(),
	email: z
		.string()
		.email("Please enter a valid email address")
		.toLowerCase()
		.trim(),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters long")
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
			"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
		)
		.trim(),
	role: z.enum(["tenant", "landload", "admin"]).default("tenant").optional(),
	avatar: z.string().optional(),
});

//user login schema
export const loginSchema = z.object({
	email: z
		.string()
		.email("Please enter a valid email address")
		.toLowerCase()
		.trim(),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters long")
		.trim(),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
