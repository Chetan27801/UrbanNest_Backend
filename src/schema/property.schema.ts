import { z } from "zod";
import {
	getEnumValues,
	Amenity,
	Highlight,
	PropertyType,
} from "../types/enums";

const locationSchema = z.object({
	address: z
		.string()
		.min(1, "Address is required")
		.max(500, "Address too long")
		.trim(),
	city: z.string().min(1, "City is required").max(100, "City too long").trim(),
	state: z
		.string()
		.min(1, "State is required")
		.max(100, "State too long")
		.trim(),
	country: z
		.string()
		.min(1, "Country is required")
		.max(100, "Country too long")
		.trim(),
	postalCode: z
		.string()
		.min(1, "Postal code is required")
		.max(10, "Postal code too long")
		.trim(),
	coordinates: z.object({
		type: z.literal("Point"),
		coordinates: z
			.array(z.number())
			.length(2)
			.describe("Longitude and latitude in that order"),
	}),
});

export const createPropertySchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long").trim(),
	description: z
		.string()
		.min(1, "Description is required")
		.max(1000, "Description too long")
		.trim(),
	pricePerMonth: z.number().min(0, "Price per month must be positive"),
	securityDeposit: z.number().min(0, "Security deposit must be positive"),
	applicationFee: z.number().min(0, "Application fee must be positive"),
	photoUrls: z.array(z.string().url()).min(1, "At least one photo is required"),
	amenities: z
		.array(z.enum(getEnumValues(Amenity) as [string, ...string[]]))
		.min(1, "At least one amenity is required"),
	highlights: z
		.array(z.enum(getEnumValues(Highlight) as [string, ...string[]]))
		.min(1, "At least one highlight is required"),
	isPetsAllowed: z.boolean().default(false),
	isParkingIncluded: z.boolean().default(false),
	beds: z.number().min(0, "Number of bedrooms must be positive"),
	baths: z.number().min(0, "Number of bathrooms must be positive"),
	squareFeet: z.number().min(1, "Square feet must be at least 1"),
	propertyType: z.enum(getEnumValues(PropertyType) as [string, ...string[]]),
	location: locationSchema,
	landlord: z.string().min(1, "Landlord is required"),
	isAvailable: z.boolean().default(true),
});

export const updatePropertySchema = createPropertySchema.partial();

//using both union and transform to handle both string and number values as postman automatically converts string to number when sending request
export const searchPropertySchema = z.object({
	//pagination
	page: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => {
			if (!val) return 1;
			return typeof val === "string" ? parseInt(val) : val;
		}),
	limit: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => {
			if (!val) return 10;
			return typeof val === "string" ? parseInt(val) : val;
		}),

	//sorting
	sortBy: z
		.enum(["pricePerMonth", "postedAt", "averageRating", "squareFeet"])
		.optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),

	//search
	search: z.string().optional(),

	//pricing filters
	minPrice: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			return typeof val === "string" ? parseInt(val) : val;
		}),
	maxPrice: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			return typeof val === "string" ? parseInt(val) : val;
		}),

	//property filters
	propertyType: z
		.enum(getEnumValues(PropertyType) as [string, ...string[]])
		.optional(),

	//property details filters
	beds: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			return typeof val === "string" ? parseInt(val) : val;
		}),
	baths: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			return typeof val === "string" ? parseInt(val) : val;
		}),
	minSquareFeet: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			return typeof val === "string" ? parseInt(val) : val;
		}),
	maxSquareFeet: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			return typeof val === "string" ? parseInt(val) : val;
		}),

	//location filters
	city: z.string().optional(),
	state: z.string().optional(),
	lat: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			return typeof val === "string" ? parseFloat(val) : val;
		}),
	lng: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			return typeof val === "string" ? parseFloat(val) : val;
		}),
	radius: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			return typeof val === "string" ? parseFloat(val) : val;
		}),

	//common amenity filters
	hasPool: z
		.union([z.string(), z.boolean()])
		.optional()
		.transform((val) => {
			if (val === undefined) return undefined;
			return typeof val === "string" ? val === "true" : val;
		}),
	hasGym: z
		.union([z.string(), z.boolean()])
		.optional()
		.transform((val) => {
			if (val === undefined) return undefined;
			return typeof val === "string" ? val === "true" : val;
		}),
	hasParking: z
		.union([z.string(), z.boolean()])
		.optional()
		.transform((val) => {
			if (val === undefined) return undefined;
			return typeof val === "string" ? val === "true" : val;
		}),
	hasPetFriendly: z
		.union([z.string(), z.boolean()])
		.optional()
		.transform((val) => {
			if (val === undefined) return undefined;
			return typeof val === "string" ? val === "true" : val;
		}),
	hasWifi: z
		.union([z.string(), z.boolean()])
		.optional()
		.transform((val) => {
			if (val === undefined) return undefined;
			return typeof val === "string" ? val === "true" : val;
		}),
	hasCable: z
		.union([z.string(), z.boolean()])
		.optional()
		.transform((val) => {
			if (val === undefined) return undefined;
			return typeof val === "string" ? val === "true" : val;
		}),
	hasDishwasher: z
		.union([z.string(), z.boolean()])
		.optional()
		.transform((val) => {
			if (val === undefined) return undefined;
			return typeof val === "string" ? val === "true" : val;
		}),

	//advanced filters
	amenities: z
		.union([
			z.array(z.enum(getEnumValues(Amenity) as [string, ...string[]])),
			z.string(),
		])
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			return Array.isArray(val) ? val : [val];
		}),
	highlights: z
		.union([
			z.array(z.enum(getEnumValues(Highlight) as [string, ...string[]])),
			z.string(),
		])
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			return Array.isArray(val) ? val : [val];
		}),
});

export type CreatePropertyType = z.infer<typeof createPropertySchema>;
export type UpdatePropertyType = z.infer<typeof updatePropertySchema>;
export type SearchPropertyType = z.infer<typeof searchPropertySchema>;
