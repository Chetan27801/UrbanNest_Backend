import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/api.Response";
import { IUser } from "../types/user.type";
import {
	findAllUsers as findAllUsersService,
	findUserById as findUserByIdService,
} from "../services/auth.services";
import { deleteUserById, updateUserById } from "../services/user.services";

const getProfile = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.user as IUser;

		const user = await findUserByIdService(id);

		if (!user) {
			return next(createError("User not found", 404));
		}

		return res.status(200).json({
			message: "Profile fetched successfully",
			user,
		});
	} catch (error) {
		console.error("Get profile error:", error);
		return next(createError("Internal server error", 500));
	}
};

const updateProfile = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = req.body;
		const { id } = req.user as IUser;

		const user = await findUserByIdService(id);

		if (!user) {
			return next(createError("User not found", 404));
		}

		const updatedUser = await updateUserById(id, data);

		return res.status(200).json({
			message: "Profile updated successfully",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Update profile error:", error);
		return next(createError("Internal server error", 500));
	}
};

const deleteProfile = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.user as IUser;

		const user = await findUserByIdService(id);

		if (!user) {
			return next(createError("User not found", 404));
		}

		await deleteUserById(id);
		return res.status(200).json({
			message: "Profile deleted successfully",
		});
	} catch (error) {
		console.error("Delete profile error:", error);
		return next(createError("Internal server error", 500));
	}
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;

		const user = await findUserByIdService(id);

		if (!user) {
			return next(createError("User not found", 404));
		}

		return res.status(200).json({
			message: "User fetched successfully",
			user,
		});
	} catch (error) {
		console.error("Get user by id error:", error);
		return next(createError("Internal server error", 500));
	}
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { page = 1, limit = 10 } = req.query;

		const { users, totalUsers } = await findAllUsersService(
			Number(page),
			Number(limit)
		);
		const totalPages = Math.ceil(totalUsers / Number(limit));

		return res.status(200).json({
			message: "Users fetched successfully",
			data: {
				users,
				totalPages,
				totalUsers,
			},
		});
	} catch (error) {
		console.error("Get all users error:", error);
		return next(createError("Internal server error", 500));
	}
};

export { getProfile, updateProfile, deleteProfile, getUserById, getAllUsers };
