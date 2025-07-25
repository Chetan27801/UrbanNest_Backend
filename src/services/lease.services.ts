import Lease from "../models/Lease.model";
import { ICreateLease, ILease } from "../types/lease.type";

export const createLease = async (leaseData: ICreateLease) => {
	const newLease = await Lease.create(leaseData);
	return newLease;
};

export const getAllLeases = async (
	userId: string,
	userRole: string,
	page: number,
	limit: number
) => {
	let leases: ILease[] = [];
	const skip = (page - 1) * limit;
	if (userRole === "landlord") {
		leases = await Lease.find({ landlord: userId }).skip(skip).limit(limit);
	} else if (userRole === "tenant") {
		leases = await Lease.find({ tenant: userId }).skip(skip).limit(limit);
	}

	const totalLeases = await Lease.countDocuments({
		$or: [{ landlord: userId }, { tenant: userId }],
	});
	return { leases, totalLeases };
};

export const getLeaseById = async (id: string) => {
	return await Lease.findById(id).populate("property", "title address");
};

export const updateLease = async (id: string, data: Partial<ILease>) => {
	return await Lease.findByIdAndUpdate(id, data, { new: true });
};

export const getLeasesByQuery = async (query: any) => {
	const id = query.id;
	const leases = await Lease.find().select("_id");
	return leases;
};
