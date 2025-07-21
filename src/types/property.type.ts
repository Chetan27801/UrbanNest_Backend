import { Document, Types } from "mongoose";
import { Amenity, Highlight, PropertyType } from "./enums";

export interface ILocation {
	address: string;
	city: string;
	state: string;
	country: string;
	postalCode: string;
	coordinates: {
		type: "Point";
		coordinates: [number, number]; // [longitude, latitude]
	};
}

export interface IProperty extends Document {
	_id: string;
	name: string;
	description: string;
	pricePerMonth: number;
	securityDeposit: number;
	applicationFee: number;
	photoUrls: string[];
	amenities: Amenity[];
	highlights: Highlight[];
	isPetsAllowed: boolean;
	isParkingIncluded: boolean;
	beds: number;
	baths: number;
	squareFeet: number;
	propertyType: PropertyType;
	postedDate: Date;
	averageRating?: number;
	numberOfReviews?: number;
	location: ILocation;
	landlord: Types.ObjectId; // Reference to User with role 'landlord'

	// Virtual fields that will be populated
	applications?: Types.ObjectId[];
	leases?: Types.ObjectId[];
	favoritedBy?: Types.ObjectId[];

	isAvailable: boolean;
	minLeaseTerm: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface ICreateProperty {
	name: string;
	description: string;
	pricePerMonth: number;
	securityDeposit: number;
	applicationFee: number;
	photoUrls?: string[];
	amenities: Amenity[];
	highlights: Highlight[];
	isPetsAllowed?: boolean;
	isParkingIncluded?: boolean;
	beds: number;
	baths: number;
	squareFeet: number;
	propertyType: PropertyType;
	location: ILocation;
	landlord: string;
}
