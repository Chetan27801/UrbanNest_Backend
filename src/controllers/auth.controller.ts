import { NextFunction, Request, Response } from "express";
import { generateToken } from "../utils/jwt_token";
import {
	createUser,
	findUserByEmail,
	findUserById,
} from "../services/auth.services";
import { IUser, IUserWithPassword } from "../types/user.type";
import passport from "../config/passport";
import { createError } from "../utils/api.Response";
import crypto from "crypto";

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

		const token = generateToken(user._id.toString(), user.role);

		return res.status(200).json({ token, user });
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
		const token = generateToken(newUser._id.toString(), newUser.role);

		return res.status(201).json({ token, user: newUser });
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
			const token = generateToken(user._id.toString(), user.role);
			return res.status(200).json({ token });
		} catch (error) {
			return next(createError("Internal server error", 500));
		}
	})(req, res, next);
};

const forgotPassword = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email } = req.body;

		const user: IUserWithPassword | null = await findUserByEmail(email);
		if (!user) {
			return next(createError("User not found", 404));
		}

		const resetToken = crypto.randomBytes(32).toString("hex");
		console.log(resetToken);
		const resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 10);

		user.resetPasswordToken = resetToken;
		user.resetPasswordTokenExpiresAt = resetTokenExpiresAt;
		await user.save();

		//TODO:send email with reset token

		return res.status(200).json({ message: "Reset password email sent" });
	} catch (error) {
		console.error("Forgot password error:", error);
		return next(createError("Internal server error", 500));
	}
};

const resetPassword = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, token, newPassword } = req.body;

		if (!token || !newPassword || !email) {
			return next(
				createError("Token, new password and email are required", 400)
			);
		}

		const user: IUserWithPassword | null = await findUserByEmail(email);
		if (!user) {
			return next(createError("User not found", 404));
		}

		if (
			user.resetPasswordTokenExpiresAt &&
			user.resetPasswordTokenExpiresAt < new Date()
		) {
			return next(createError("Token expired", 400));
		}

		if (user.resetPasswordToken !== token) {
			return next(createError("Invalid token", 400));
		}

		user.password = newPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordTokenExpiresAt = undefined;
		await user.save();

		return res.status(200).json({ message: "Password reset successfully" });
	} catch (error) {
		console.error("Reset password error:", error);
		return next(createError("Internal server error", 500));
	}
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { _id, role } = req.user as IUser;

		const user = await findUserById(_id);

		if (!user) {
			return next(createError("User not found", 404));
		}

		if (user.isVerified) {
			return next(createError("Email already verified", 400));
		}

		if (role === "admin") {
			user.isVerified = true;
			await user.save();
			return res.status(200).json({ message: "Email verified" });
		}

		//TODO: send email to user to verify email
		const verificationToken = crypto.randomBytes(32).toString("hex");
		const verificationTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 10);

		user.verificationToken = verificationToken;
		user.verificationTokenExpiresAt = verificationTokenExpiresAt;
		await user.save();

		return res.status(200).json({ message: "Verification email sent" });
	} catch (error) {
		console.error("Verify email error:", error);
		return next(createError("Internal server error", 500, String(error)));
	}
};

const isEmailVerified = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, verificationToken } = req.body;

		if (!email || !verificationToken) {
			return next(
				createError("Email and verification token are required", 400)
			);
		}

		const user = await findUserByEmail(email);

		if (!user) {
			return next(createError("User not found", 404));
		}

		if (
			user.verificationTokenExpiresAt &&
			user.verificationTokenExpiresAt < new Date()
		) {
			return next(createError("Verification token expired", 400));
		}

		if (user.verificationToken !== verificationToken) {
			return next(createError("Invalid verification token", 400));
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		return res.status(200).json({ message: "Email verified" });
	} catch (error) {
		console.error("Is email verified error:", error);
		return next(createError("Internal server error", 500));
	}
};

export {
	register,
	login,
	googleAuth,
	googleAuthCallback,
	forgotPassword,
	resetPassword,
	verifyEmail,
	isEmailVerified,
};
