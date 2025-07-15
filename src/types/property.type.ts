import { Document, Types } from "mongoose";

export interface IProperty extends Document {
	title: string;
	description: string;
	landlord: Types.ObjectId;
	location: {
		address: string;
		city: string;
		state: string;
		country: string;
		coordinates: [number, number];
	};
	pricing: {
		rent: number;
		deposit: number;
		leaseTerm: number;
	};
	specifications: {
		bedrooms: number;
		bathrooms: number;
		area: number;
		propertyType: string;
		furnished: boolean;
		yearBuilt: number;
		floorNumber: number;
		floorPlan: string;
		totalFloors: number;
		hasElevator: boolean;
	};
	amenities: string[];
	highlights: string[];
	policies: {
		petsAllowed: boolean;
		smokingAllowed: boolean;
		minimumLeaseTerm: number;
		maximumLeaseTerm: number;
	};
	media: {
		images: {
			url: string;
			caption: string;
			isPrimary: boolean;
		}[];
	};
	availability: {
		isAvailable: boolean;
		availableFrom: Date;
		availableTo: Date;
	};
	stats: {
		views: number;
		saves: number;
	};
	rating: {
		average: number;
		count: number;
	};
	status: string;
}
