import { Document, Types } from "mongoose";
import { PaymentStatus } from "./enums";

export interface IPayment extends Document {
	_id: string;
	amountDue: number;
	amountPaid: number;
	dueDate: Date;
	paymentDate?: Date;
	paymentStatus: PaymentStatus;
	lease: Types.ObjectId;
	paymentMethod?: string;
	transactionId?: string;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ICreatePayment {
	amountDue: number;
	dueDate: Date;
	lease: string;
	paymentMethod?: string;
	notes?: string;
}
