import Lease from "../models/Lease.model";
import { LeaseStatus } from "../types/enums";
import { ICreateLease, ILease } from "../types/lease.type";
import { generateRecurringPayments } from "./payment.services";

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
	return await Lease.findById(id)
		.populate(
			"property",
			"name description pricePerMonth photoUrls location propertyType beds baths squareFeet amenities highlights isPetsAllowed isParkingIncluded"
		)
		.populate("tenant", "name email phoneNumber avatar")
		.populate("landlord", "name email phoneNumber avatar")
		.populate("application");
};

export const updateLease = async (id: string, data: Partial<ILease>) => {
	return await Lease.findByIdAndUpdate(id, data, { new: true });
};

export const getLeasesByQuery = async (query: any) => {
	const id = query.id;
	const leases = await Lease.find().select("_id");
	return leases;
};
