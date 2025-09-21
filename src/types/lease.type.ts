import { Document, Types } from "mongoose";

export interface ILease extends Document {
	_id: string;
	startDate: Date;
	endDate: Date;
	rent: number;
	deposit: number;
	property: Types.ObjectId;
	tenant: Types.ObjectId;
	landlord: Types.ObjectId;
	application?: Types.ObjectId;
	isActive: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ICreateLease {
	startDate: Date;
	endDate: Date;
	rent: number;
	deposit: number;
	property: string;
	tenant: string;
	landlord: string;
	application?: string;
}
