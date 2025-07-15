import { CustomError } from "../middleware/error.middleware";

export const createError = (
	message: string,
	statusCode: number,
	stack?: string
): CustomError => {
	const err = new Error(message) as CustomError;
	err.statusCode = statusCode;
	err.stack = stack;
	return err;
};
