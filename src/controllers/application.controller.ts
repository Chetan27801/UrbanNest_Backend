import { NextFunction, Request, Response } from "express";
import { IUser } from "../types/user.type";
import { createError } from "../utils/api.Response";
import { getPropertyById as getPropertyByIdService } from "../services/property.services";
import {
	getAllApplications as getAllApplicationsService,
	getApplicationByPropertyIdAndTenantId as getApplicationByPropertyIdAndTenantIdService,
	getApplicationById as getApplicationByIdService,
	updateAllApplication as updateAllApplicationService,
	getAllApplicationsByLandlord as getAllApplicationsByLandlordService,
} from "../services/application.services";
import { createApplication as createApplicationService } from "../services/application.services";
import { ApplicationStatus, PropertyStatus } from "../types/enums";
import { IProperty } from "../types/property.type";
import { updateProperty as updatePropertyService } from "../services/property.services";
import { ICreateLease } from "../types/lease.type";
import { createLease as createLeaseService } from "../services/lease.services";
import mongoose from "mongoose";

//--------------------------------Controllers--------------------------------

//--------------------------------Apply for Property------------------------------  --
export const applyForProperty = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;
		const user = req.user as IUser;
		const { message } = req.body;

		//Check if user is a tenant
		if (user.role !== "tenant") {
			return next(createError("Only tenants can apply for properties", 401));
		}

		//Check if property exists
		const property = await getPropertyByIdService({ _id: id });
		if (!property) {
			return next(createError("Property not found", 404));
		}

		//Check if property is available
		if (property.isAvailable === false) {
			return next(createError("Property is not available", 400));
		}

		const existingApplication =
			await getApplicationByPropertyIdAndTenantIdService(id, user._id);

		//Check if tenant has already applied for this property
		if (existingApplication) {
			return next(
				createError("You have already applied for this property", 400)
			);
		}

		const applicationData = {
			property: id,
			tenant: user._id,
			message,
		};

		const newApplication = await createApplicationService(applicationData);

		return res.status(201).json({
			success: true,
			message: "Application submitted successfully",
			data: newApplication,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//--------------------------------Get All Applications--------------------------------
export const getAllApplications = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const query: any = { tenant: user._id };

		const applications = await getAllApplicationsService(query);

		return res.status(200).json({
			success: true,
			message: "Applications fetched successfully",
			data: applications,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//--------------------------------Get Application By Id--------------------------------

export const getApplicationById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;

		const application = await getApplicationByIdService(id);

		if (!application) {
			return next(createError("Application not found", 404));
		}

		return res.status(200).json({
			success: true,
			message: "Application fetched successfully",
			data: application,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//--------------------------------Update Application--------------------------------
export const updateApplication = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.params;
	const { status } = req.body;

	//start transaction
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const application = await getApplicationByIdService(id);
		if (!application) {
			await session.abortTransaction();
			await session.endSession();
			return next(createError("Application not found", 404));
		}
		if (application.status !== ApplicationStatus.Pending) {
			await session.abortTransaction();
			await session.endSession();
			return next(createError("Application is already processed", 400));
		}

		const propertyId = application.property.toString();
		application.status = status;
		await application.save({ session });

		if (status === ApplicationStatus.Approved) {
			await updateAllApplicationService(id, propertyId, session); //update all applications status to rejected except the current one

			//update property status to unavailable
			await updatePropertyService(
				{ _id: propertyId },
				{ isAvailable: false },
				{ session }
			);
		}

		await session.commitTransaction();
		await session.endSession();

		//TODO: Send email to tenant about the approval or rejection
		return res.status(200).json({
			success: true,
			message: "Application updated successfully",
		});
	} catch (error) {
		await session.abortTransaction();
		await session.endSession();
		return next(createError("Internal server error", 500, String(error)));
	}
};

//--------------------------------Get All Applications By Landlord--------------------------------

//TODO: Add pagination
export const getAllApplicationsByLandlord = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const applications = await getAllApplicationsByLandlordService(user._id);

		return res.status(200).json({
			success: true,
			message: "Applications fetched successfully",
			data: applications,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};
