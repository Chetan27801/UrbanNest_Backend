import User from "../models/User.model";

const updateUserById = async (id: string, data: any) => {
	const user = await User.findByIdAndUpdate(id, data, { new: true });
	return user;
};

const deleteUserById = async (id: string) => {
	await User.findByIdAndDelete(id);
};

export { updateUserById, deleteUserById };
