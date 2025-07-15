import { NextFunction, Request, Response } from "express";
import { generateToken } from "../utils/jwt_token";
import { createUser, findUserByEmail } from "../services/auth.services";
import { IUserWithPassword } from "../types/user.type";
import passport from "../config/passport";
import { createError } from "../utils/api.Response";

const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return next(createError("Email and password are required", 400));
		}

		const user: IUserWithPassword | null = await findUserByEmail(email);

		if (!user) {
			return next(createError("Invalid credentials", 401));
		}

		const isPasswordValid = await user.comparePassword(password);

		if (!isPasswordValid) {
			return next(createError("Invalid credentials", 401));
		}

		const token = generateToken(user._id.toString());

		return res.status(200).json({ token });
	} catch (error) {
		console.error("Login error:", error);
		return next(createError("Internal server error", 500));
	}
};

const register = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userData = req.body;

		if (!userData.name || !userData.email || !userData.password) {
			return next(createError("All fields are required", 400));
		}

		const existingUser = await findUserByEmail(userData.email);

		if (existingUser) {
			return next(createError("User already exists", 400));
		}

		const newUser = await createUser(userData);
		const token = generateToken(newUser._id.toString());

		return res.status(201).json({ token });
	} catch (error) {
		console.error("Registration error:", error);
		return next(createError("Internal server error", 500));
	}
};

const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate("google", { scope: ["profile", "email"] })(
		req,
		res,
		next
	);
};
const googleAuthCallback = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	passport.authenticate("google", { session: false }, (err: any, user: any) => {
		if (err) {
			return next(err);
		}
		if (!user) {
			return next(createError("Authentication failed", 401));
		}

		try {
			const token = generateToken(user._id.toString());
			return res.status(200).json({ token });
		} catch (error) {
			return next(createError("Internal server error", 500));
		}
	})(req, res, next);
};

export { register, login, googleAuth, googleAuthCallback };
