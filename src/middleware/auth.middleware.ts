import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import { createError } from "../utils/api.Response";

const authMiddleware = (allowedRoles: string[] = []) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const token = req.headers.authorization?.split(" ")[1];
			if (!token) {
				return next(createError("Unauthorized", 401));
			}

			const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
				_id: string;
				role: string;
			};

			//Role verification
			const userRole = decoded.role.toLowerCase();

			const hasAccess =
				allowedRoles.length === 0 || allowedRoles.includes(userRole);

			if (!hasAccess) {
				return next(createError("Access denied", 403));
			}
			//Add user to request object
			req.user = decoded;
		} catch (error) {
			return next(createError("Invalid token", 400));
		}

		next();
	};
};

export default authMiddleware;
