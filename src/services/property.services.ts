import Property from "../models/Property.model";

//TODO: Add type to functions

//Schema
import {
	CreatePropertyType,
	UpdatePropertyType,
} from "../schema/property.schema";

export const createProperty = async (propertyData: CreatePropertyType) => {
	const newProperty = await Property.create(propertyData);
	return newProperty;
};

export const getAllProperties = async () => {
	const properties = await Property.find();
	return properties;
};

export const getPropertyById = async (propertyId: string) => {
	const property = await Property.findOne({ _id: propertyId });
	return property;
};

export const updateProperty = async (
	propertyId: string,
	propertyData: UpdatePropertyType
) => {
	const updatedProperty = await Property.findByIdAndUpdate(
		propertyId,
		propertyData,
		{ new: true }
	);
	return updatedProperty;
};

export const deleteProperty = async (propertyId: string) => {
	await Property.findByIdAndDelete(propertyId);
};
