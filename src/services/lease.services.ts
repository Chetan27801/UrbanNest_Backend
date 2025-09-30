import Lease from "../models/Lease.model";
import { LeaseStatus } from "../types/enums";
import { ICreateLease, ILease } from "../types/lease.type";
import { generateRecurringPayments } from "./payment.services";
import { MediaService } from "../utils/media";

export const createLease = async (leaseData: ICreateLease) => {
	const newLease = await Lease.create(leaseData);

	//generate recurring payments
	if (newLease.isActive === LeaseStatus.Active) {
		await generateRecurringPayments(
			newLease._id,
			newLease.rent,
			newLease.startDate,
			newLease.endDate
		);
	}
	return newLease;
};

export const getAllLeases = async (
	userId: string,
	userRole: string,
	page: number,
	limit: number,
	status: string
) => {
	let leases: ILease[] = [];
	let totalLeases: number = 0;
	const skip = (page - 1) * limit;
	if (userRole === "landlord") {
		if (status === "all") {
			leases = await Lease.find({ landlord: userId })
				.populate("property")
				.populate("tenant")
				.populate("landlord")
				.populate("application")
				.skip(skip)
				.limit(limit);
			totalLeases = await Lease.countDocuments({ landlord: userId });
		} else {
			leases = await Lease.find({ landlord: userId, isActive: status })
				.populate("property")
				.populate("tenant")
				.populate("landlord")
				.populate("application")
				.skip(skip)
				.limit(limit);
			totalLeases = await Lease.countDocuments({
				landlord: userId,
				isActive: status,
			});
		}
	} else if (userRole === "tenant") {
		if (status === "all") {
			leases = await Lease.find({ tenant: userId })
				.populate("property")
				.populate("tenant")
				.populate("landlord")
				.populate("application")
				.skip(skip)
				.limit(limit);
			totalLeases = await Lease.countDocuments({ tenant: userId });
		} else {
			leases = await Lease.find({ tenant: userId, isActive: status })
				.populate("property")
				.populate("tenant")
				.populate("landlord")
				.populate("application")
				.skip(skip)
				.limit(limit);
			totalLeases = await Lease.countDocuments({
				tenant: userId,
				isActive: status,
			});
		}
	}

	// Refresh URLs for all leases
	const Property = require("../models/Property.model").default;
	const User = require("../models/User.model").default;
	for (const lease of leases) {
		// Refresh property URLs
		if (lease.property && (lease.property as any).photoUrls) {
			const photoUrls = (lease.property as any).photoUrls;
			if (photoUrls && photoUrls.length > 0) {
				const freshUrls = await MediaService.refreshUrls(photoUrls);
				await Property.findByIdAndUpdate((lease.property as any)._id, {
					photoUrls: freshUrls,
				});
				(lease.property as any).photoUrls = freshUrls;
			}
		}

		// Refresh tenant avatar
		if (lease.tenant && (lease.tenant as any).avatar) {
			const tenantAvatar = (lease.tenant as any).avatar;
			const freshAvatarUrls = await MediaService.refreshUrls([tenantAvatar]);
			await User.findByIdAndUpdate((lease.tenant as any)._id, {
				avatar: freshAvatarUrls[0],
			});
			(lease.tenant as any).avatar = freshAvatarUrls[0];
		}

		// Refresh landlord avatar
		if (lease.landlord && (lease.landlord as any).avatar) {
			const landlordAvatar = (lease.landlord as any).avatar;
			const freshAvatarUrls = await MediaService.refreshUrls([landlordAvatar]);
			await User.findByIdAndUpdate((lease.landlord as any)._id, {
				avatar: freshAvatarUrls[0],
			});
			(lease.landlord as any).avatar = freshAvatarUrls[0];
		}
	}

	return {
		leases,
		pagination: {
			page,
			totalPages: Math.ceil(totalLeases / limit),
			totalItems: totalLeases,
			hasNextPage: page < Math.ceil(totalLeases / limit),
			hasPreviousPage: page > 1,
			limit,
		},
	};
};

export const getLeaseById = async (id: string) => {
	const lease = await Lease.findById(id)
		.populate(
			"property",
			"name description pricePerMonth photoUrls location propertyType beds baths squareFeet amenities highlights isPetsAllowed isParkingIncluded"
		)
		.populate("tenant", "name email phoneNumber avatar")
		.populate("landlord", "name email phoneNumber avatar")
		.populate("application");

	if (!lease) return lease;

	// Refresh URLs
	const Property = require("../models/Property.model").default;
	const User = require("../models/User.model").default;

	// Refresh property URLs
	if (lease.property && (lease.property as any).photoUrls) {
		const photoUrls = (lease.property as any).photoUrls;
		if (photoUrls && photoUrls.length > 0) {
			const freshUrls = await MediaService.refreshUrls(photoUrls);
			await Property.findByIdAndUpdate((lease.property as any)._id, {
				photoUrls: freshUrls,
			});
			(lease.property as any).photoUrls = freshUrls;
		}
	}

	// Refresh tenant avatar
	if (lease.tenant && (lease.tenant as any).avatar) {
		const tenantAvatar = (lease.tenant as any).avatar;
		const freshAvatarUrls = await MediaService.refreshUrls([tenantAvatar]);
		await User.findByIdAndUpdate((lease.tenant as any)._id, {
			avatar: freshAvatarUrls[0],
		});
		(lease.tenant as any).avatar = freshAvatarUrls[0];
	}

	// Refresh landlord avatar
	if (lease.landlord && (lease.landlord as any).avatar) {
		const landlordAvatar = (lease.landlord as any).avatar;
		const freshAvatarUrls = await MediaService.refreshUrls([landlordAvatar]);
		await User.findByIdAndUpdate((lease.landlord as any)._id, {
			avatar: freshAvatarUrls[0],
		});
		(lease.landlord as any).avatar = freshAvatarUrls[0];
	}

	return lease;
};

export const updateLease = async (id: string, data: Partial<ILease>) => {
	return await Lease.findByIdAndUpdate(id, data, { new: true });
};

export const getLeasesByQuery = async (query: any) => {
	const id = query.id;
	const leases = await Lease.find().select("_id");
	return leases;
};
