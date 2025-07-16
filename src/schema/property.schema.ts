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
});

export const updatePropertySchema = createPropertySchema.partial();

export type CreatePropertyType = z.infer<typeof createPropertySchema>;
export type UpdatePropertyType = z.infer<typeof updatePropertySchema>;
