import { Document, Types } from "mongoose";

export interface ILease extends Document {
	_id: string;
	startDate: Date;
	endDate: Date;
	rent: number;
	deposit: number;
	property: Types.ObjectId;
	tenant: Types.ObjectId;
	application?: Types.ObjectId;
	isActive: boolean;
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
	application?: string;
}
