import Application from "../models/Application.model";
import Property from "../models/Property.model";
import Lease from "../models/Lease.model";

//TODO: Add type to functions

//Schema
import {
	CreatePropertyType,
	SearchPropertyType,
	UpdatePropertyType,
} from "../schema/property.schema";
import { ApplicationStatus } from "../types/enums";
import { ICreateLease } from "../types/lease.type";

export const createProperty = async (propertyData: CreatePropertyType) => {
	const newProperty = await Property.create(propertyData);
	return newProperty;
};

export const getAllProperties = async (query: any) => {
	const properties = await Property.find(query).populate(
		"landlord",
		"name email"
	);
	return properties;
};

export const getPropertyById = async (query: any) => {
	const property = await Property.findOne(query).populate(
		"landlord",
		"name email"
	);
	return property;
};

export const updateProperty = async (
	query: any,
	propertyData: UpdatePropertyType,
	options?: { session?: any }
) => {
	await Property.findOneAndUpdate(query, propertyData, options);
};

export const deleteProperty = async (query: any) => {
	await Property.findOneAndDelete(query);
};

export const searchProperty = async (filters: SearchPropertyType) => {
	const {
		page = 1,
		limit = 10,
		sortBy = "postedAt",
		sortOrder = "desc",
		search = "",
		minPrice,
		maxPrice,
		propertyType,
		beds,
		baths,
		minSquareFeet,
		maxSquareFeet,
		city,
		state,
		lat,
		lng,
		radius,
		hasPool,
		hasGym,
		hasParking,
		hasPetFriendly,
		hasWifi,
		hasCable,
		hasDishwasher,
		amenities,
		highlights,
	} = filters;

	//Base query - only show available properties
	const query: any = { isAvailable: true };

	//text search in name and description
	if (search) {
		query.$or = [
			{ name: { $regex: search, $options: "i" } },
			{ description: { $regex: search, $options: "i" } },
		];
	}

	//pricing filters
	if (minPrice || maxPrice) {
		query.pricePerMonth = {};
		if (minPrice) query.pricePerMonth.$gte = minPrice;
		if (maxPrice) query.pricePerMonth.$lte = maxPrice;
	}

	//property type filter
	if (propertyType) {
		query.propertyType = propertyType;
	}

	//amenities filter
	if (amenities && amenities.length > 0) {
		query.amenities = { $all: amenities };
	}

	//highlights filter
	if (highlights && highlights.length > 0) {
		query.highlights = { $all: highlights };
	}

	//bed and bath filters
	if (beds) {
		query.beds = beds;
	}
	if (baths) {
		query.baths = baths;
	}

	//square feet filters
	if (minSquareFeet || maxSquareFeet) {
		query.squareFeet = {};
		if (minSquareFeet) query.squareFeet.$gte = minSquareFeet;
		if (maxSquareFeet) query.squareFeet.$lte = maxSquareFeet;
	}

	//location filters
	if (city) query["location.city"] = city;
	if (state) query["location.state"] = state;
	if (lat && lng && radius) {
		// Validate coordinates
		if (lat < -90 || lat > 90) {
			throw new Error("Latitude must be between -90 and 90");
		}
		if (lng < -180 || lng > 180) {
			throw new Error("Longitude must be between -180 and 180");
		}
		if (radius <= 0 || radius > 20037.5) {
			throw new Error("Radius must be between 0 and 20037.5 kilometers");
		}

		// Convert radius from kilometers to radians (Earth radius = 6371 km)
		const radiusInRadians = radius / 6371;
		// geo location filter - find properties within the specified radius
		query["location.coordinates"] = {
			$geoWithin: {
				$centerSphere: [
					[lng, lat], // [longitude, latitude]
					radiusInRadians,
				],
			},
		};
	}

	//boolean filters
	if (hasPool) query.hasPool = hasPool;
	if (hasGym) query.hasGym = hasGym;
	if (hasParking) query.hasParking = hasParking;
	if (hasPetFriendly) query.hasPetFriendly = hasPetFriendly;
	if (hasWifi) query.hasWifi = hasWifi;
	if (hasCable) query.hasCable = hasCable;
	if (hasDishwasher) query.hasDishwasher = hasDishwasher;

	//calculate pagination
	const skip = (page - 1) * limit;

	//sort
	const sort: any = {};
	sort[sortBy] = sortOrder === "desc" ? -1 : 1;

	//execute query

	const [properties, total] = await Promise.all([
		Property.find(query)
			.sort(sort)
			.skip(skip)
			.limit(limit)
			.populate("landlord", "name email"),
		Property.countDocuments(query),
	]);

	return {
		properties,
		pagination: {
			currentPage: page,
			totalPages: Math.ceil(total / limit),
			totalItems: total,
			hasNextPage: page < Math.ceil(total / limit),
			hasPreviousPage: page > 1,
			limit,
		},
		appliedFilters: filters,
	};
};

//create lease
