import { NextFunction, Request, Response } from "express";

export interface CustomError extends Error {
	statusCode?: number;
	message: string;
	stack?: string;
}

const errorMiddleware = (
	err: CustomError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let statusCode = err.statusCode || 500;
	let message = err.message || "Internal Server Error";
	let stack = err.stack || "";

	if (err.name === "ValidationError") {
		statusCode = 400;
		message = "Validation Error";
	} else if (err.name === "JsonWebTokenError") {
		statusCode = 401;
		message = "Invalid token";
	} else if (err.name === "TokenExpiredError") {
		statusCode = 401;
		message = "Token Expired";
	}

	//log error details
	console.error({
		error: err.message,
		stack,
		statusCode,
		method: req.method,
		url: req.url,
		timestamp: new Date().toISOString(),
		// user: req.user || "anonymous",
	});

	if (res.headersSent) {
		return next(err);
	}

	res.status(statusCode).json({
		success: false,
		error: {
			message:
				process.env.NODE_ENV === "production"
					? "Something went wrong"
					: message,
			...(process.env.NODE_ENV === "development" && {
				stack,
				statusCode,
				details: err,
			}),
		},
	});
};

export default errorMiddleware;
