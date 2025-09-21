import Application from "../models/Application.model";
import Lease from "../models/Lease.model";
import Payment from "../models/Payment.model";
import Property from "../models/Property.model";
import User from "../models/User.model";
import { ApplicationStatus, getEnumValues, PropertyType } from "../types/enums";
import { Types } from "mongoose";

const adminStatsOverview = async () => {
	const [
		totalUsers,
		totalProperties,
		totalLeases,
		totalPayments,
		totalApplications,
	] = await Promise.all([
		User.countDocuments(),
		Property.countDocuments(),
		Lease.countDocuments(),
		Payment.countDocuments(),
		Application.countDocuments(),
	]);

	return {
		totalUsers,
		totalProperties,
		totalLeases,
		totalPayments,
		totalApplications,
	};
};

const getAllUsers = async (skip: number, limit: number) => {
	const [users, totalCount] = await Promise.all([
		User.find()
			.skip(skip)
			.limit(limit)
			.select("name email role createdAt avatar"),
		User.countDocuments(),
	]);

	return { users, totalCount };
};

const updateUser = async (id: string, data: any) => {
	const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
};

const tenantStatsOverview = async (id: string) => {
	const [currentActiveLeases, upcomingPayments, recentApplications] =
		await Promise.all([
			Lease.countDocuments({
				tenant: id,
				isActive: true,
			}),
			Payment.aggregate([
				{
					$lookup: {
						from: "leases",
						localField: "lease",
						foreignField: "_id",
						as: "leaseInfo",
					},
				},
				{
					$match: {
						"leaseInfo.tenant": new Types.ObjectId(id),
						paymentStatus: { $in: ["pending", "overdue"] },
						dueDate: { $gte: new Date() },
					},
				},
				{
					$count: "total",
				},
			]).then((result) => result[0]?.total || 0),
			Application.countDocuments({
				tenant: id,
				status: ApplicationStatus.Pending,
			}),
		]);

	return {
		currentActiveLeases,
		upcomingPayments,
		recentApplications,
	};
};

//TODO: Implement this after knowing aggregation pipeline
const getTenantPaymentsData = async (id: string) => {
	return {
		totalPaid: 0,
		overduePayments: 0,
		overdueAmount: 0,
	};
};

const landlordStatsOverview = async (id: string) => {
	return {
		totalProperties: 0,
		occupiedProperties: 0,
		vacantProperties: 0,
		totalPendingApplications: 0,
		totalPendingLeases: 0,
		totalPendingPayments: 0,
	};
};

const getLandlordFinancials = async (id: string) => {
	return {
		totalRevenue: 0,
		totalRevenueThisMonth: 0,
		totalRevenueThisYear: 0,
		listOfOverduePayments: [],
	};
};

const getPropertyDataForHome = async (type: string) => {
	const propertyTypes = type === "all" ? getEnumValues(PropertyType) : [type];
	const properties = await Property.find({
		propertyType: { $in: propertyTypes },
	})
		.sort({ postedDate: -1 })
		.limit(8)
		.select(
			"name pricePerMonth photoUrls propertyType averageRating numberOfReviews isAvailable location"
		);

	const totalProperties = await Property.countDocuments();
	const totalAvailableProperties = await Property.countDocuments({
		isAvailable: true,
	});
	const totalUsers = await User.countDocuments();
	const totalApplications = await Application.countDocuments();

	return {
		properties,
		totalProperties,
		totalAvailableProperties,
		totalUsers,
		totalApplications,
	};
};
export {
	adminStatsOverview,
	getAllUsers,
	updateUser,
	tenantStatsOverview,
	getTenantPaymentsData,
	landlordStatsOverview,
	getLandlordFinancials,
	getPropertyDataForHome,
};
