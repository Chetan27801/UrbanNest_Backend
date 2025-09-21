import { NextFunction, Request, Response } from "express";
import { IUser } from "../types/user.type";
import { createError } from "../utils/api.Response";
import { getPropertyById as getPropertyByIdService } from "../services/property.services";
import {
	getAllApplications as getAllApplicationsService,
	getApplicationByPropertyIdAndTenantId as getApplicationByPropertyIdAndTenantIdService,
	getApplicationById as getApplicationByIdService,
	getApplicationByIdForUpdate as getApplicationByIdForUpdateService,
	updateAllApplication as updateAllApplicationService,
	getAllApplicationsByLandlord as getAllApplicationsByLandlordService,
} from "../services/application.services";
import { createApplication as createApplicationService } from "../services/application.services";
import { ApplicationStatus, LeaseStatus, PropertyStatus } from "../types/enums";
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
			applicationDate: new Date(),
			status: ApplicationStatus.Pending,
			property: id,
			tenant: user._id,
			message,
			lease: null,
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
		const { page, limit } = req.query;
		const query: any = { tenant: user._id };

		const applications = await getAllApplicationsService(
			query,
			Number(page),
			Number(limit)
		);

		return res.status(200).json({
			success: true,
			message: "Applications fetched successfully",
			applications: applications.applications,
			pagination: applications.pagination,
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
	const { status, leaseDetails } = req.body;
	console.log(req.body);
	const user = req.user as IUser;
	// Validate status value
	if (!Object.values(ApplicationStatus).includes(status)) {
		return next(createError("Invalid application status", 400));
	}

	//start transaction
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const application = await getApplicationByIdForUpdateService(id);
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

		let lease = null;

		if (status === ApplicationStatus.Approved) {
			if (!leaseDetails) {
				await session.abortTransaction();
				await session.endSession();
				return next(createError("Lease data is required", 400));
			}

			await updateAllApplicationService(id, propertyId, session); //update all applications status to rejected except the current one
			console.log("all applications updated");
			//update property status to unavailable
			await updatePropertyService(
				{ _id: propertyId },
				{ isAvailable: false },
				{ session }
			);

			//Create lease
			const leaseData = {
				...leaseDetails,
				property: propertyId,
				application: id,
				tenant: application.tenant.toString(),
				landlord: user._id,
				isActive: LeaseStatus.Active,
			};

			lease = await createLeaseService(leaseData);

			application.lease = new mongoose.Types.ObjectId(lease._id);
			await application.save({ session });
		}

		console.log("application updated");

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

//--------------------------------Check Application Status for Property--------------------------------
export const checkApplicationStatus = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { propertyId } = req.params;
		const user = req.user as IUser;

		//Check if user is a tenant
		if (user.role !== "tenant") {
			return next(
				createError("Only tenants can check application status", 401)
			);
		}

		const existingApplication =
			await getApplicationByPropertyIdAndTenantIdService(propertyId, user._id);

		return res.status(200).json({
			success: true,
			message: "Application status checked successfully",
			data: {
				hasApplied: !!existingApplication,
				application: existingApplication || null,
			},
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//--------------------------------Get All Applications By Landlord--------------------------------

export const getAllApplicationsByLandlord = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const { status } = req.params;
		const { page, limit } = req.query;
		const applications = await getAllApplicationsByLandlordService(
			user._id,
			Number(page),
			Number(limit),
			status
		);

		return res.status(200).json({
			success: true,
			message: "Applications fetched successfully",
			applications: applications.allApplications,
			pagination: applications.pagination,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};
