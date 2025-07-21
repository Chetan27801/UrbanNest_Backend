import { Document, Types } from "mongoose";
import { ApplicationStatus } from "./enums";

export interface IApplication extends Document {
	_id: string;
	applicationDate: Date;
	status: ApplicationStatus;
	property: Types.ObjectId;
	tenant: Types.ObjectId;
	message?: string;
	lease?: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

export interface ICreateApplication {
	property: string;
	tenant: string;
	message?: string;
}
