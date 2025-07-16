import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/api.Response";

//Schema
import {
	CreatePropertyType,
	UpdatePropertyType,
} from "../schema/property.schema";

//Services
import {
	createProperty as createPropertyService,
	getAllProperties as getAllPropertiesService,
	getPropertyById as getPropertyByIdService,
	updateProperty as updatePropertyService,
	deleteProperty as deletePropertyService,
} from "../services/property.services";
import { success } from "zod/v4";

export const createProperty = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const property: CreatePropertyType = req.body;

		const newProperty = await createPropertyService(property);

		return res.status(201).json(newProperty);
	} catch (error) {
		return next(createError("Internal server error", 500));
	}
};
export const getAllProperties = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const properties = await getAllPropertiesService();
		return res.status(200).json({
			success: true,
			message: "Properties fetched successfully",
			data: properties,
		});
	} catch (error) {
		return next(createError("Internal server error", 500));
	}
};
export const getPropertyById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;
		const property = await getPropertyByIdService(id);
		return res.status(200).json({
			success: true,
			message: "Property fetched successfully",
			data: property,
		});
	} catch (error) {
		return next(createError("Internal server error", 500));
	}
};
export const updateProperty = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;
		const propertyData: UpdatePropertyType = req.body;
		const updatedProperty = await updatePropertyService(id, propertyData);

		return res.status(200).json({
			success: true,
			message: "Property updated successfully",
			data: updatedProperty,
		});
	} catch (error) {
		return next(createError("Internal server error", 500));
	}
};
export const deleteProperty = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;
		await deletePropertyService(id);
		return res.status(200).json({
			success: true,
			message: "Property deleted successfully",
		});
	} catch (error) {
		return next(createError("Internal server error", 500));
	}
};
