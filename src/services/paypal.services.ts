import { paypalClient } from "../config/paypal";
import {
	ApiError,
	CheckoutPaymentIntent,
	OrdersController,
	OrderApplicationContextShippingPreference,
} from "@paypal/paypal-server-sdk";

const ordersController = new OrdersController(paypalClient);
export interface PayPalPaymentData {
	amount: number;
	currency?: string;
	description?: string;
	returnUrl?: string;
	cancelUrl?: string;
}

export const createPayPalOrder = async (paymentData: PayPalPaymentData) => {
	const collect = {
		body: {
			intent: CheckoutPaymentIntent.Capture,
			purchaseUnits: [
				{
					amount: {
						currencyCode:
							paymentData.currency || process.env.PAYPAL_CURRENCY || "USD",
						value: paymentData.amount.toString(),
					},
					description: paymentData.description || "Rent Payment",
				},
			],
			applicationContext: {
				returnUrl: paymentData.returnUrl || "http://localhost:3000/success",
				cancelUrl: paymentData.cancelUrl || "http://localhost:3000/cancel",
				shippingPreference:
					OrderApplicationContextShippingPreference.NoShipping,
				landingPage: "LOGIN", // Forces login page instead of guest checkout
				userAction: "PAY_NOW", // Skip review step
			},
		},
	};

	try {
		const { result, ...httpResponse } = await ordersController.createOrder(
			collect as any
		);

		return { result, httpResponse };
	} catch (error) {
		console.error("PayPal Order Creation Error:", error);
		if (error instanceof ApiError) {
			const errorResult = error.result;
			console.error("PayPal API Error Details:", errorResult);
			throw new Error(`PayPal API Error: ${error.message || "Unknown error"}`);
		} else {
			console.error("Unexpected error:", error);
			throw new Error("Failed to create PayPal order");
		}
	}
};

export const capturePayPalOrder = async (orderId: string) => {
	const collect = {
		id: orderId,
	};
	try {
		const { result, ...httpResponse } = await ordersController.captureOrder(
			collect as any
		);
		return { result, httpResponse };
	} catch (error) {
		console.error("PayPal Capture Order Error:", error);
		if (error instanceof ApiError) {
			const errorResult = error.result;
			console.error("PayPal API Error Details:", errorResult);
			throw new Error(`PayPal API Error: ${error.message || "Unknown error"}`);
		} else {
			console.error("Unexpected error:", error);
			throw new Error("Failed to capture PayPal order");
		}
	}
};
