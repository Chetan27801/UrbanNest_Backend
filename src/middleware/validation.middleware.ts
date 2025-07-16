import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createError } from "../utils/api.Response";

export const validateSchema = (schema: z.ZodSchema<any>) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedData = schema.parse(req.body);
			req.body = validatedData;
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
