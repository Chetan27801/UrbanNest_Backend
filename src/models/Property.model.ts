import { Schema, model } from "mongoose";
import { IProperty } from "../types/property.type";
import {
	getEnumValues,
	Amenity,
	Highlight,
	PropertyType,
} from "../types/enums";

const locationSchema = new Schema(
	{
		address: {
			type: String,
			required: [true, "Address is required"],
			trim: true,
		},
		city: {
			type: String,
			required: [true, "City is required"],
			trim: true,
		},
		state: {
			type: String,
			required: [true, "State is required"],
			trim: true,
		},
		country: {
			type: String,
			required: [true, "Country is required"],
			trim: true,
			default: "India",
		},
		postalCode: {
			type: String,
			required: [true, "Postal code is required"],
			trim: true,
		},
		coordinates: {
			type: {
				type: String,
				enum: ["Point"],
				required: true,
			},
			coordinates: {
				type: [Number], // [longitude, latitude]
				required: true,
			},
		},
	},
	{ _id: false }
);

const propertySchema = new Schema<IProperty>(
	{
		name: {
			type: String,
			required: [true, "Property name is required"],
			trim: true,
			maxlength: [100, "Property name cannot exceed 100 characters"],
		},
		description: {
			type: String,
			required: [true, "Property description is required"],
			trim: true,
			maxlength: [2000, "Description cannot exceed 2000 characters"],
		},
		pricePerMonth: {
			type: Number,
			required: [true, "Monthly price is required"],
			min: [0, "Price cannot be negative"],
		},
		securityDeposit: {
			type: Number,
			required: [true, "Security deposit is required"],
			min: [0, "Security deposit cannot be negative"],
		},
		applicationFee: {
			type: Number,
			required: [true, "Application fee is required"],
			min: [0, "Application fee cannot be negative"],
		},
		photoUrls: {
			type: [String],
			default: [],
			validate: {
				validator: function (urls: string[]) {
					return urls.length <= 10; // Maximum 10 photos
				},
				message: "Maximum 10 photos allowed",
			},
		},
		amenities: {
			type: [String],
			enum: {
				values: getEnumValues(Amenity),
				message: "Invalid amenity",
			},
			default: [],
		},
		highlights: {
			type: [String],
			enum: {
				values: getEnumValues(Highlight),
				message: "Invalid highlight",
			},
			default: [],
		},
		isPetsAllowed: {
			type: Boolean,
			default: false,
		},
		isParkingIncluded: {
			type: Boolean,
			default: false,
		},
		beds: {
			type: Number,
			required: [true, "Number of bedrooms is required"],
			min: [0, "Bedrooms cannot be negative"],
		},
		baths: {
			type: Number,
			required: [true, "Number of bathrooms is required"],
			min: [0, "Bathrooms cannot be negative"],
		},
		squareFeet: {
			type: Number,
			required: [true, "Square feet is required"],
			min: [1, "Square feet must be at least 1"],
		},
		propertyType: {
			type: String,
			enum: {
				values: getEnumValues(PropertyType),
				message: "Invalid property type",
			},
			required: [true, "Property type is required"],
		},
		postedDate: {
			type: Date,
			default: Date.now,
		},
		averageRating: {
			type: Number,
			default: 0,
			min: [0, "Rating cannot be negative"],
			max: [5, "Rating cannot exceed 5"],
		},
		numberOfReviews: {
			type: Number,
			default: 0,
			min: [0, "Number of reviews cannot be negative"],
		},
		location: {
			type: locationSchema,
			required: [true, "Location is required"],
		},
		landlord: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Landlord is required"],
		},
		isAvailable: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Indexes for performance
propertySchema.index({ "location.coordinates": "2dsphere" }); // Geospatial index
propertySchema.index({ landlord: 1 });
propertySchema.index({ pricePerMonth: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ beds: 1, baths: 1 });
propertySchema.index({ isAvailable: 1 });
propertySchema.index({ postedDate: -1 });

// Virtual fields
propertySchema.virtual("applications", {
	ref: "Application",
	localField: "_id",
	foreignField: "property",
});

propertySchema.virtual("leases", {
	ref: "Lease",
	localField: "_id",
	foreignField: "property",
});

// Ensure virtual fields are included in JSON output
propertySchema.set("toJSON", { virtuals: true });
propertySchema.set("toObject", { virtuals: true });

const Property = model<IProperty>("Property", propertySchema);

export default Property;
