import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { NextFunction } from "express";
import { createError } from "../utils/api.Response";

export const socketAuthMiddleware = async (
	socket: Socket,
	next: NextFunction
) => {
	try {
		const token =
			socket.handshake.auth.token ||
			socket.handshake.headers.authorization?.split(" ")[1];

		if (!token) {
			return next(createError("Unauthorized", 401));
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
			_id: string;
			role: string;
		};

		//Add user to request object
		socket.data.user = decoded;

		next();
	} catch (error) {
		next(createError("Invalid token", 400));
	}
};
