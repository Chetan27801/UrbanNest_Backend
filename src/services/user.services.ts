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

export { getUserById, updateUserById, deleteUserById };
