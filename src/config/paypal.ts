import { Client, Environment, LogLevel } from "@paypal/paypal-server-sdk";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
	throw new Error(
		"PayPal credentials are missing. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables."
	);
}

const environment =
	process.env.NODE_ENV === "production"
		? Environment.Production
		: Environment.Sandbox;

export const paypalClient = new Client({
	clientCredentialsAuthCredentials: {
		oAuthClientId: clientId,
		oAuthClientSecret: clientSecret,
	},
	timeout: 30000, // 30 seconds timeout instead of 0
	environment: environment,
	logging: {
		logLevel: LogLevel.Info,
		logRequest: {
			logBody: true,
		},
		logResponse: {
			logHeaders: true,
		},
	},
});
