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

export { findUserByEmail, createUser, findUserByGoogleId, findUserById };
