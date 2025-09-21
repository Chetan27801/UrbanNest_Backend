import { Document, Types } from "mongoose";
import { PaymentStatus } from "./enums";

export interface IPayment extends Document {
	_id: string;
	amountDue: number;
	amountPaid: number;
	currency?: string;
	dueDate: Date;
	paymentDate?: Date;
	paymentStatus: PaymentStatus;
	lease: Types.ObjectId;
	paymentMethod?: string;
	transactionId?: string;
	notes?: string;
	paypalOrderId?: string;
	payPalPayerEmail?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ICreatePayment {
	amountDue: number;
	currency?: string;
	dueDate: Date;
	lease: string;
	paymentMethod?: string;
	notes?: string;
}

export interface IPayPalPayment {
	paymentId: string;
	amount: number;
	description: string;
}

export interface IPayPalCapture {
	paymentId: string;
	orderId: string;
}
