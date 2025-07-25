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
import { updateProperty as updatePropertyService } from "../services/property.services";
import { updateAllApplication as updateApplicationService } from "../services/application.services";

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
		const { page = 1, limit = 10 } = req.query;

		const { leases, totalLeases } = await getAllLeasesService(
			user._id,
			user.role,
			Number(page),
			Number(limit)
		);

		const totalPages = Math.ceil(totalLeases / Number(limit));

		return res.status(200).json({
			success: true,
			message: "Leases fetched successfully",
			data: {
				leases,
				totalPages,
				totalLeases,
			},
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

		if (!lease) {
			return next(createError("Lease not found", 404));
		}

		//update property status to available
		await updatePropertyService(
			{
				property: lease?.property,
				landlord: lease?.landlord,
			},
			{ isAvailable: true }
		);

		//update application status to rejected
		await updateApplicationService(
			lease?.application?.toString() || "",
			lease?.property?.toString() || ""
		);

		return res.status(200).json({
			success: true,
			message: "Lease terminated successfully",
			data: lease,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};
