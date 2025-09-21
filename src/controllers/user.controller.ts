import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/api.Response";
import { IUser } from "../types/user.type";
import {
	findAllUsers as findAllUsersService,
	findUserById as findUserByIdService,
} from "../services/auth.services";
import {
	getUserById as getUserWithRefresh,
	deleteUserById,
	updateUserById,
	getFavoriteProperties as getFavoritePropertiesService,
} from "../services/user.services";

import { getPropertyById as getPropertyByIdService } from "../services/property.services";
import { MediaService } from "../utils/media";
import { ILease } from "../types/lease.type";
const getProfile = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { _id: id } = req.user as IUser;

		const user = await getUserWithRefresh(id);
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
		const { avatarKey, ...data } = req.body;
		const { _id: id } = req.user as IUser;
		const user = await findUserByIdService(id);

		if (!user) {
			return next(createError("User not found", 404));
		}

		if (avatarKey) {
			const existingAvatar = await MediaService.getUserAvatar(id);
			if (existingAvatar) {
				await MediaService.deleteFromS3(existingAvatar.key);
			}
			data.avatar = await MediaService.getMediaUrl(avatarKey);
		}

		console.log(data);
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

		const existingAvatar = await MediaService.getUserAvatar(id);
		if (existingAvatar) await MediaService.deleteFromS3(existingAvatar.key);

		await updateUserById(id, { avatar: null });

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

		const user = await getUserWithRefresh(id);

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
		const { role, _id: id } = req.user as IUser;
		let { users, totalUsers, totalPages, hasNextPage, hasPreviousPage } =
			await findAllUsersService(Number(page), Number(limit), role, id);

		let tusers: any = [];
		if (role === "landlord") {
			users.map((user: any) => {
				if (user.tenant) {
					tusers.push({
						...user.tenant._doc,
					});
				}
			});
			users = tusers;
		}

		return res.status(200).json({
			success: true,
			message: "Users fetched successfully",
			users,

			pagination: {
				page: Number(page),
				limit: Number(limit),
				totalPages,
				totalUsers,
				hasNextPage,
				hasPreviousPage,
			},
		});
	} catch (error) {
		console.error("Get all users error:", error);
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

const toggleFavoriteProperty = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.user as IUser;
		const { propertyId } = req.body;
		if (!propertyId) {
			return next(createError("Property ID is required", 400));
		}

		const property = await getPropertyByIdService(propertyId);
		if (!property) {
			return next(createError("Property not found", 404));
		}

		const user = (await findUserByIdService(id)) as IUser;

		if (!user.favoriteProperties) {
			user.favoriteProperties = [];
		}

		const isCurrentPropertyFavorite =
			user.favoriteProperties.includes(propertyId);

		let action = isCurrentPropertyFavorite ? "removed" : "added";

		if (isCurrentPropertyFavorite) {
			user.favoriteProperties = user.favoriteProperties.filter(
				(id: string) => id !== propertyId
			);
		} else {
			user.favoriteProperties.push(propertyId);
		}
		await user.save();

		return res.status(200).json({
			success: true,
			message: `Favorite property ${action} successfully`,
			data: {
				propertyId,
				action,
				isFavorited: !isCurrentPropertyFavorite,
				totalFavorites: user.favoriteProperties.length,
			},
		});
	} catch (error) {
		console.error("Toggle favorite property error:", error);
		return next(createError("Internal server error", 500));
	}
};

const getFavoriteProperties = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.user as IUser;
		const { page = 1, limit = 10 } = req.query;
		const data = await getFavoritePropertiesService(
			id,
			Number(page),
			Number(limit)
		);

		return res.status(200).json({
			success: true,
			message: "Favorite properties fetched successfully",
			properties: data.properties,
			pagination: data.pagination,
			appliedFilters: data.appliedFilters,
		});
	} catch (error) {
		console.error("Get favorite properties error:", error);
		return next(createError("Internal server error", 500));
	}
};

export {
	getProfile,
	updateProfile,
	deleteProfile,
	getUserById,
	getAllUsers,
	getAvatar,
	deleteAvatar,
	toggleFavoriteProperty,
	getFavoriteProperties,
};
