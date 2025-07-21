import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createError } from "../utils/api.Response";

export const validateParams = (schema: z.ZodSchema<any>) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedData = schema.safeParse(req.params);
			if (!validatedData.success) {
				return next(
					createError("Validation error", 400, validatedData.error.message)
				);
			}
			req.params = validatedData.data;
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errorMessages = error.errors.map((err) => err.message).join(", ");
				return next(createError("Validation error", 400, errorMessages));
			}
			return next(createError("Invalid request data", 400));
		}
	};
};

export const validateQuery = (schema: z.ZodSchema<any>) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedData = schema.safeParse(req.query);
			if (!validatedData.success) {
				return next(
					createError("Validation error", 400, validatedData.error.message)
				);
			}
			req.query = validatedData.data;
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errorMessages = error.errors.map((err) => err.message).join(", ");
				return next(createError("Validation error", 400, errorMessages));
			}
			return next(createError("Invalid request data", 400));
		}
	};
};

export const validateBody = (schema: z.ZodSchema<any>) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedData = schema.safeParse(req.body);
			if (!validatedData.success) {
				return next(
					createError("Validation error", 400, validatedData.error.message)
				);
			}
			req.body = validatedData.data;
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errorMessages = error.errors.map((err) => err.message).join(", ");
				return next(createError("Validation error", 400, errorMessages));
			}
			return next(createError("Invalid request data", 400));
		}
	};
};
