import Application from "../models/Application.model";
import { ApplicationStatus } from "../types/enums";
import Property from "../models/Property.model";
import { MediaService } from "../utils/media";

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

	// Refresh URLs for all applications
	for (const application of applications) {
		if (application.property && (application.property as any).photoUrls) {
			const photoUrls = (application.property as any).photoUrls;
			if (photoUrls && photoUrls.length > 0) {
				const freshUrls = await MediaService.refreshUrls(photoUrls);
				await Property.findByIdAndUpdate((application.property as any)._id, {
					photoUrls: freshUrls,
				});
				(application.property as any).photoUrls = freshUrls;
			}
		}
	}

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

	// Refresh URLs for all applications
	const User = require("../models/User.model").default;
	for (const application of allApplications) {
		// Refresh property URLs
		if (application.property && (application.property as any).photoUrls) {
			const photoUrls = (application.property as any).photoUrls;
			if (photoUrls && photoUrls.length > 0) {
				const freshUrls = await MediaService.refreshUrls(photoUrls);
				await Property.findByIdAndUpdate((application.property as any)._id, {
					photoUrls: freshUrls,
				});
				(application.property as any).photoUrls = freshUrls;
			}
		}

		// Refresh tenant avatar
		if (application.tenant && (application.tenant as any).avatar) {
			const tenantAvatar = (application.tenant as any).avatar;
			const freshAvatarUrls = await MediaService.refreshUrls([tenantAvatar]);
			await User.findByIdAndUpdate((application.tenant as any)._id, {
				avatar: freshAvatarUrls[0],
			});
			(application.tenant as any).avatar = freshAvatarUrls[0];
		}

		// Refresh landlord avatar
		if (
			application.property &&
			(application.property as any).landlord &&
			(application.property as any).landlord.avatar
		) {
			const landlordAvatar = (application.property as any).landlord.avatar;
			const freshAvatarUrls = await MediaService.refreshUrls([landlordAvatar]);
			await User.findByIdAndUpdate((application.property as any).landlord._id, {
				avatar: freshAvatarUrls[0],
			});
			(application.property as any).landlord.avatar = freshAvatarUrls[0];
		}
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
