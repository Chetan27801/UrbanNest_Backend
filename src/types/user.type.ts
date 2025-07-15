import { Schema, Document } from "mongoose";

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
