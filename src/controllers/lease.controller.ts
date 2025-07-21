import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/api.Response";
import {
	createLease as createLeaseService,
	getLeaseById as getLeaseByIdService,
	getAllLeases as getAllLeasesService,
	updateLease as updateLeaseService,
} from "../services/lease.services";
import { ICreateLease } from "../types/lease.type";
import { IUser } from "../types/user.type";

//------------------------Controllers------------------------

//---------------------------------Create Lease---------------------------------
export const createLease = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const data: ICreateLease = { ...req.body, landlord: user._id };

		const lease = await createLeaseService(data);

		return res.status(200).json({
			success: true,
			message: "Lease created successfully",
			data: lease,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//---------------------------------Get All Leases---------------------------------
export const getAllLease = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;

		const leases = await getAllLeasesService(user._id, user.role);

		return res.status(200).json({
			success: true,
			message: "Leases fetched successfully",
			data: leases,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//---------------------------------Get Lease By Id---------------------------------

export const getLeaseById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const { id } = req.params;

		const lease = await getLeaseByIdService(id);

		return res.status(200).json({
			success: true,
			message: "Lease fetched successfully",
			data: lease,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//---------------------------------Update Lease---------------------------------

export const terminateLease = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;

		const { id } = req.params;

		const lease = await updateLeaseService(id, { isActive: false });

		return res.status(200).json({
			success: true,
			message: "Lease terminated successfully",
			data: lease,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};
