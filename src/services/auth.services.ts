import Lease from "../models/Lease.model";
import Property from "../models/Property.model";
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
// const findAllUsers = async (
// 	page: number,
// 	limit: number,
// 	role: string,
// 	id: string
// ) => {
// 	const skip = (page - 1) * limit;
// 	let users: IUser[] = [];
// 	let totalUsers: number = 0;
// 	if (role === "admin") {
// 		[users, totalUsers] = await Promise.all([
// 			User.find({}).skip(skip).limit(limit),
// 			User.countDocuments(),
// 		]);
// 	} else {
// 		const tenants = await Lease.distinct("tenant", { landlord: id });
// 		users = await User.find({ _id: { $in: tenants } })
// 			.skip(skip)
// 			.limit(limit);
// 		totalUsers = tenants.length;
// 	}
// 	const totalPages = Math.ceil(totalUsers / limit);
// 	const hasNextPage = page < totalPages;
// 	const hasPreviousPage = page > 1;

// 	return { users, totalUsers, totalPages, hasNextPage, hasPreviousPage };
// };

interface IUserWithTotalProperties extends IUser {
	totalProperties: number;
}

const findAllUsers = async (
	page: number,
	limit: number,
	role: string,
	id: string
) => {
	const skip = (page - 1) * limit;
	let users: any = [];
	let totalUsers: number = 0;
	if (role === "admin") {
		[users, totalUsers] = await Promise.all([
			User.find({}).skip(skip).limit(limit),
			User.countDocuments(),
		]);
	} else if (role === "landlord") {
		users = await Lease.find({ landlord: id }).populate("tenant");
		totalUsers = users.length;
	}

	const totalPages = Math.ceil(totalUsers / limit);
	const hasNextPage = page < totalPages;
	const hasPreviousPage = page > 1;

	return { users, totalUsers, totalPages, hasNextPage, hasPreviousPage };
};

export {
	findUserByEmail,
	createUser,
	findUserByGoogleId,
	findUserById,
	findAllUsers,
};
