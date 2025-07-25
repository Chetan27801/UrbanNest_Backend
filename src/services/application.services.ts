import Application from "../models/Application.model";
import { ApplicationStatus, PropertyStatus } from "../types/enums";
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

export const getAllApplications = async (query: any) => {
	const applications = await Application.find(query).populate(
		"property",
		"name"
	);
	return applications;
};

export const getApplicationById = async (id: string) => {
	const application = await Application.findById(id)
		.populate("property", "name")
		.populate("tenant", "name email");
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
