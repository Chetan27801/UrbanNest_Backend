import { Document } from "mongoose";

// Type for creating a new user (only the schema fields)
export interface ICreateUser {
	name: string;
	email: string;
	password?: string;
	googleId?: string;
	avatar?: string;
	role?: "tenant" | "landlord" | "admin";
}

// TypeScript interface for User document
export interface IUser extends Document {
	_id: string; // Explicitly define _id
	name: string;
	email: string;
	password?: string;
	googleId?: string;
	avatar?: string;
	role: "tenant" | "landlord" | "admin";
	phoneNumber?: string;
	isVerified: boolean;
	verificationToken?: string;
	verificationTokenExpiresAt?: Date;
	resetPasswordToken?: string;
	resetPasswordTokenExpiresAt?: Date;

	//Role specific fields

	//Landlord profile
	landlordProfile?: {
		businessName?: string;
		licenseNumber?: string;
		rating?: number;
		totalReviews?: number;
		totalProperties?: number;
		isVerifiedLandlord?: boolean;
	};

	//Tenant profile
	tenantProfile?: {
		occupation?: string;
		monthlyIncome?: number;
		emergencyContact?: {
			name?: string;
			phoneNumber?: string;
			relationship?: string;
		};
		preferences?: {
			priceRange?: {
				min?: number;
				max?: number;
			};
			preferredLocation?: string[];
			amenities?: string[];
			petFriendly?: boolean;
		};
	};

	//Activity tracking
	lastActive?: Date;
	isOnline?: boolean;

	createdAt: Date;
	updatedAt: Date;

	// Instance methods
	comparePassword(candidatePassword: string): Promise<boolean>;
	hashPassword(password: string): Promise<string>;
	toJSON(): any; //improve this
}

// Type for user with password included (for authentication)
export interface IUserWithPassword extends IUser {
	password: string;
}
