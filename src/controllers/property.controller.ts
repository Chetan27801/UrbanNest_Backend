import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/api.Response";

//Schema
import {
	CreatePropertyType,
	UpdatePropertyType,
	searchPropertySchema,
} from "../schema/property.schema";

//Services
import {
	createProperty as createPropertyService,
	getAllProperties as getAllPropertiesService,
	getPropertyById as getPropertyByIdService,
	updateProperty as updatePropertyService,
	deleteProperty as deletePropertyService,
	searchProperty as searchPropertyService,
} from "../services/property.services";

//Utils
import { MediaService } from "../utils/media";

import { IUser } from "../types/user.type";

//--------------------------------Controllers--------------------------------

//--------------------------------Create Property--------------------------------
export const createProperty = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const property: CreatePropertyType = {
			...req.body,
			landlord: user._id,
		};

		const newProperty = await createPropertyService(property);

		return res.status(201).json(newProperty);
	} catch (error) {
		return next(createError("Internal server error", 500));
	}
};

//--------------------------------Get All Properties--------------------------------
export const getAllProperties = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		let query = {};

		const user = req.user as IUser;
		let { page = 1, limit = 10 } = req.query;

		//If user is landlord, only fetch properties that belong to them
		if (user.role === "landlord") {
			query = {
				landlord: user._id,
			};
		}
		page = Number(page);
		limit = Number(limit);

		const properties = await getAllPropertiesService(query, page, limit);

		return res.status(200).json({
			success: true,
			message: "Properties fetched successfully",
			data: properties,
		});
	} catch (error) {
		return next(createError("Internal server error", 500));
	}
};

//--------------------------------Get Property By Id--------------------------------
export const getPropertyById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;

		let query: any = { _id: req.params.id };

		//If user is landlord, only fetch properties that belong to them
		if (user && user.role === "landlord") {
			query.landlord = user._id;
		}

		const property = await getPropertyByIdService(query);

		return res.status(200).json({
			success: true,
			message: "Property fetched successfully",
			data: property,
		});
	} catch (error) {
		return next(createError("Internal server error", 500));
	}
};

//--------------------------------Update Property--------------------------------
export const updateProperty = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;

		const user = req.user as IUser;
		const query: any = { _id: id, landlord: user._id };

		const propertyData: UpdatePropertyType = req.body;

		const updatedProperty = await updatePropertyService(query, propertyData);

		return res.status(200).json({
			success: true,
			message: "Property updated successfully",
			data: updatedProperty,
		});
	} catch (error) {
		return next(createError("Internal server error", 500));
	}
};

//--------------------------------Delete Property--------------------------------
export const deleteProperty = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;
		const user = req.user as IUser;
		const query: any = { _id: id, landlord: user._id };

		await deletePropertyService(query);
		return res.status(200).json({
			success: true,
			message: "Property deleted successfully",
		});
	} catch (error) {
		return next(createError("Internal server error", 500));
	}
};

//--------------------------------Search Property--------------------------------
export const searchProperty = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const filters = searchPropertySchema.parse(req.query);

		const result = await searchPropertyService(filters);

		return res.status(200).json({
			success: true,
			message: "Properties fetched successfully",
			data: result,
			pagination: result.pagination,
			appliedFilters: result.appliedFilters,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//--------------------------------AI Search--------------------------------
//TODO: AI Search implementation with Perplexity API
export const aiSearch = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//Upload single property image
export const uploadImage = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const image = req.file;
		const { propertyId, catergory = "gallery" } = req.body;

		if (!image) {
			return next(createError("No image provided", 400));
		}

		if (!propertyId) {
			return next(createError("Property Id is required", 400));
		}

		const uploadResult = await MediaService.uploadPropertyMedia(
			image,
			propertyId,
			"image",
			catergory
		);

		return res.status(200).json({
			success: true,
			message: "Image uploaded successfully",
			data: uploadResult,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

//upload property video
export const uploadVideo = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const video = req.file;
		const { propertyId } = req.body;

		if (!video) {
			return next(createError("No video provided", 400));
		}

		if (!propertyId) {
			return next(createError("Property Id is required", 400));
		}

		const uploadResult = await MediaService.uploadPropertyMedia(
			video,
			propertyId,
			"video",
			"tours"
		);

		return res.status(200).json({
			success: true,
			message: "Video uploaded successfully",
			data: uploadResult,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

export const uploadMultipleMedia = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const files = req.files as Express.Multer.File[];
		const { propertyId } = req.body;

		if (!files || files.length === 0) {
			return next(createError("No files provided", 400));
		}
		if (!propertyId) {
			return next(createError("Property Id is required", 400));
		}

		const uploadPromises = files.map((file) => {
			const mediaType = file.mimetype.startsWith("image/") ? "image" : "video";
			const category = mediaType === "image" ? "gallery" : "tours";

			return MediaService.uploadPropertyMedia(
				file,
				propertyId,
				mediaType,
				category
			);
		});

		const uploadResults = await Promise.all(uploadPromises);

		return res.status(200).json({
			success: true,
			message: "Files uploaded successfully",
			data: uploadResults,
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};

export const deleteMedia = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { key } = req.params;

		if (!key) {
			return next(createError("Media key is required", 400));
		}

		await MediaService.deleteFromS3(key);

		return res.status(200).json({
			success: true,
			message: "Media deleted successfully",
		});
	} catch (error) {
		return next(createError("Internal server error", 500, String(error)));
	}
};
