import { Request, Response } from "express";
import { NextFunction } from "express";
import { createError } from "../utils/api.Response";
import {
	adminStatsOverview as adminStatsOverviewService,
	getAllUsers as getAllUsersService,
	updateUser as updateUserService,
	tenantStatsOverview as tenantStatsOverviewService,
	getTenantPaymentsData as getTenantPaymentsDataService,
	landlordStatsOverview as landlordStatsOverviewService,
	getLandlordFinancials as getLandlordFinancialsService,
	getPropertyDataForHome as getPropertyDataForHomeService,
	getTotalPayments as getTotalPaymentsService,
} from "../services/stats.services";
import { IUser } from "../types/user.type";

//---------------------------------ADMIN---------------------------------

//---------------------------------Admin Stats Overview---------------------------------
export const getAdminOverview = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = await adminStatsOverviewService();
		if (!data) {
			return next(createError("No data found", 404));
		}
		return res.status(200).json({
			success: true,
			message: "Admin overview fetched successfully",
			data,
		});
	} catch (error) {
		return next(createError("Internal server error", 500));
	}
};

//---------------------------------All Users---------------------------------

export const getAllUsers = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const skip = (Number(page) - 1) * Number(limit);
		const { users, totalCount } = await getAllUsersService(skip, Number(limit));

		const totalPages = Math.ceil(totalCount / Number(limit));

		return res.status(200).json({
			success: true,
			message: "Users fetched successfully",
			users,
			totalPages,
			totalCount,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//---------------------------------Verify Landlord---------------------------------
export const verifyLandlord = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;
		const { isVerified } = req.body;

		const updatedUser = await updateUserService(id, {
			landlordProfile: { isVerifiedLandlord: isVerified },
		});

		return res.status(200).json({
			success: true,
			message: "Landlord verified successfully",
			data: updatedUser,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//---------------------------------TENANT---------------------------------

export const getTenantOverview = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;

		const data = await tenantStatsOverviewService(user._id);

		return res.status(200).json({
			success: true,
			message: "Tenant overview fetched successfully",
			data,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//TODO: complete this after knowing aggregation pipeline
export const getTenantPayments = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const data = await getTenantPaymentsDataService(user._id);

		return res.status(200).json({
			success: true,
			message: "Tenant payments fetched successfully",
			data,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//---------------------------------LANDLORD---------------------------------

//TODO: complete this after knowing aggregation pipeline
export const getLandlordOverview = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;

		const data = await landlordStatsOverviewService(user._id);
		return res.status(200).json({
			success: true,
			message: "Landlord overview fetched successfully",
			data,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

export const getLandlordFinancials = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const data = await getLandlordFinancialsService(user._id);

		return res.status(200).json({
			success: true,
			message: "Landlord financials fetched successfully",
			data,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

export const getPropertyDataForHome = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { type } = req.params;
		const data = await getPropertyDataForHomeService(type);

		return res.status(200).json({
			success: true,
			message: "Property data fetched successfully",
			data,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

export const getTotalPayments = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const data = await getTotalPaymentsService(user._id);

		return res.status(200).json({
			success: true,
			message: "Total payments fetched successfully",
			data,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};
