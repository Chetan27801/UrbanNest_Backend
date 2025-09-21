import Application from "../models/Application.model";
import { ApplicationStatus } from "../types/enums";
import Property from "../models/Property.model";

export const createApplication = async (applicationData: any) => {
	const newApplication = await Application.create(applicationData);
	return newApplication;
};

export const getApplicationByPropertyIdAndTenantId = async (
	propertyId: string,
	tenantId: string
) => {
	const application = await Application.findOne({
		property: propertyId,
		tenant: tenantId,
	});
	return application;
};

export const getAllApplications = async (
	query: any,
	page: number,
	limit: number
) => {
	const skip = (page - 1) * limit;
	const applications = await Application.find(query)
		.populate("property", "name photoUrls location pricePerMonth beds baths")
		.populate("tenant", "name email")
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit);

	const totalApplications = await Application.countDocuments(query);

	return {
		applications,
		pagination: {
			page,
			limit,
			totalPages: Math.ceil(totalApplications / limit),
			hasNextPage: page < Math.ceil(totalApplications / limit),
			hasPreviousPage: page > 1,
			totalItems: totalApplications,
		},
	};
};

export const getAllApplicationsByLandlord = async (
	landlordId: string,
	page: number,
	limit: number,
	status: string
) => {
	const skip = (page - 1) * limit;
	// 1. Find properties for the landlord
	const properties = await Property.find({ landlord: landlordId })
		.select("_id")
		.lean();
	const propertyIds = properties.map((p) => p._id);

	// 2. Find applications and populate all data, including the lease
	let allApplications;
	let totalApplications;
	if (status === "all") {
		allApplications = await Application.find({
			property: { $in: propertyIds },
		})
			.populate({
				path: "property",
				populate: {
					path: "landlord",
					select: "name email phoneNumber",
				},
			})
			.populate({
				path: "tenant",
				select: "name email avatar phoneNumber",
			})
			.populate({
				path: "lease",
				select: "startDate endDate rent isActive",
			})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		totalApplications = await Application.countDocuments({
			property: { $in: propertyIds },
		});
	} else {
		allApplications = await Application.find({
			property: { $in: propertyIds },
			status: status,
		})
			.populate({
				path: "property",
				populate: {
					path: "landlord",
					select: "name email phoneNumber",
				},
			})
			.populate({
				path: "tenant",
				select: "name email avatar phoneNumber",
			})
			.populate({
				path: "lease",
				select: "startDate endDate rent isActive",
			})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		totalApplications = await Application.countDocuments({
			property: { $in: propertyIds },
			status: status,
		});
	}

	return {
		allApplications,
		pagination: {
			page,
			limit,
			totalPages: Math.ceil(totalApplications / limit),
			hasNextPage: page < Math.ceil(totalApplications / limit),
			hasPreviousPage: page > 1,
			totalItems: totalApplications,
		},
	};
};

export const getApplicationById = async (id: string) => {
	const application = await Application.findById(id)
		.populate("property", "name")
		.populate("tenant", "name email");
	return application;
};

export const getApplicationByIdForUpdate = async (id: string) => {
	const application = await Application.findById(id);
	return application;
};

export const updateAllApplication = async (
	id: string,
	propertyId: string,
	session?: any
) => {
	return await Application.updateMany(
		{ property: propertyId, _id: { $ne: id } }, //update all applications except the current one (ne = not equal)
		{ $set: { status: ApplicationStatus.Rejected } },
		{ session }
	);
};
