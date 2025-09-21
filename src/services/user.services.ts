import User from "../models/User.model";
import { MediaService } from "../utils/media";

const getUserById = async (id: string) => {
	const user = await User.findById(id);

	if (!user) return user;

	// Refresh avatar URL if exists
	if (user.avatar) {
		const freshUrls = await MediaService.refreshUrls([user.avatar]);
		await User.findByIdAndUpdate(id, { avatar: freshUrls[0] });
		user.avatar = freshUrls[0];
	}

	return user;
};

const updateUserById = async (id: string, data: any) => {
	const user = await User.findByIdAndUpdate(id, data, { new: true });
	return user;
};

const deleteUserById = async (id: string) => {
	await User.findByIdAndDelete(id);
};

const getFavoriteProperties = async (
	id: string,
	page: number,
	limit: number
) => {
	const skip = (page - 1) * limit;
	const data = await User.findById(id)
		.populate({
			path: "favoriteProperties",
			model: "Property",
			populate: {
				path: "landlord",
				model: "User",
				select: "name email phoneNumber avatar",
			},
		})
		.skip(skip)
		.limit(limit);

	const properties = data?.favoriteProperties;
	const total = properties?.length || 0;

	return {
		properties,
		pagination: {
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNextPage: page < Math.ceil(total / limit),
			hasPreviousPage: page > 1,
			totalItems: total,
		},
		appliedFilters: {
			page,
			limit,
		},
	};
};

export { getUserById, updateUserById, deleteUserById, getFavoriteProperties };
