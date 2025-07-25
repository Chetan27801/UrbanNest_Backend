import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/api.Response";
import { IUser } from "../types/user.type";
import {
	findAllUsers as findAllUsersService,
	findUserById as findUserByIdService,
} from "../services/auth.services";
import { deleteUserById, updateUserById } from "../services/user.services";
import { MediaService } from "../utils/media";

const getProfile = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.user as IUser;

		const user = await findUserByIdService(id);

		if (!user) {
			return next(createError("User not found", 404));
		}

		return res.status(200).json({
			success: true,
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
			success: true,
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
			success: true,
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
			success: true,
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
			success: true,
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

const uploadAvatar = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.user as IUser;
		const { file } = req;
		if (!file) {
			return next(createError("No file uploaded", 400));
		}

		const existingAvatar = await MediaService.getUserAvatar(id);
		if (existingAvatar) {
			await MediaService.deleteFromS3(existingAvatar.key);
		}

		const uploadResult = await MediaService.uploadUserAvatar(file, id);

		await updateUserById(id, { avatar: uploadResult.url });

		return res.status(200).json({
			success: true,
			message: "Avatar uploaded successfully",
			data: uploadResult,
		});
	} catch (error) {
		console.error("Upload avatar error:", error);
		return next(createError("Internal server error", 500));
	}
};

const getAvatar = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.user as IUser;

		const avatar = await MediaService.getUserAvatar(id);

		if (!avatar) {
			return next(createError("Avatar not found", 404));
		}

		return res.status(200).json({
			success: true,
			message: "Avatar fetched successfully",
			data: avatar,
		});
	} catch (error) {
		console.error("Get avatar error:", error);
		return next(createError("Internal server error", 500));
	}
};

const deleteAvatar = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.user as IUser;

		const existingAvatar = await MediaService.getUserAvatar(id);
		if (!existingAvatar) {
			return next(createError("Avatar not found", 404));
		}

		await MediaService.deleteFromS3(existingAvatar.key);
		await updateUserById(id, { avatar: null });

		return res.status(200).json({
			success: true,
			message: "Avatar deleted successfully",
		});
	} catch (error) {
		console.error("Delete avatar error:", error);
		return next(createError("Internal server error", 500));
	}
};

export { getProfile, updateProfile, deleteProfile, getUserById, getAllUsers, uploadAvatar, getAvatar, deleteAvatar };
