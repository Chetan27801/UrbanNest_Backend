import User from "../models/User.model";
import { IUser, IUserWithPassword, ICreateUser } from "../types/user.type";

//find user by email (with password for authentication)
const findUserByEmail = async (
	email: string
): Promise<IUserWithPassword | null> => {
	return await User.findOne({ email }).select("+password");
};

//find user by id
const findUserById = async (id: string) => {
	return await User.findById(id);
};

//find user by google id
const findUserByGoogleId = async (googleId: string) => {
	return await User.findOne({ googleId });
};

//create user
const createUser = async (userData: ICreateUser) => {
	return await User.create(userData);
};

//find all users
const findAllUsers = async (page: number, limit: number) => {
	const skip = (page - 1) * limit;
	const [users, totalUsers] = await Promise.all([
		User.find({}).skip(skip).limit(limit),
		User.countDocuments(),
	]);

	return { users, totalUsers };
};

export {
	findUserByEmail,
	createUser,
	findUserByGoogleId,
	findUserById,
	findAllUsers,
};
