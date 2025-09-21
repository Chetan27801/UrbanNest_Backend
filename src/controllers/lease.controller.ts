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
import Application from "../models/Application.model";
import { LeaseStatus } from "../types/enums";
//------------------------Controllers------------------------

//NOT NEEDED ANYMORE
//---------------------------------Create Lease---------------------------------
export const createLease = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const data: ICreateLease = { ...req.body, landlord: user._id };

		if (!data.application || !data.property || !data.tenant || !data.landlord) {
			return next(createError("All fields are required", 400));
		}

		const lease = await createLeaseService(data);
		await Application.findByIdAndUpdate(data.application, {
			lease: lease._id,
		});

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
		const { status } = req.params;

		const { leases, pagination } = await getAllLeasesService(
			user._id,
			user.role,
			Number(page),
			Number(limit),
			status
		);

		return res.status(200).json({
			success: true,
			message: "Leases fetched successfully",
			leases,
			pagination,
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
		const { id } = req.params;

		const lease = await updateLeaseService(id, {
			isActive: LeaseStatus.Terminated,
			endDate: new Date(),
		});

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

		return res.status(200).json({
			success: true,
			message: "Lease terminated successfully",
			data: lease,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};
