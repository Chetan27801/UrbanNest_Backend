import cron from "node-cron";
import { markPaymentAsOverdue } from "../services/payment.services";

export const scheduleOverduePayments = () => {
	cron.schedule(
		"1 0 * * *",
		async () => {
			console.log("Running overdue payments check...");
			try {
				const overdueCount = await markPaymentAsOverdue();
				console.log(`Marked ${overdueCount} payments as overdue`);
			} catch (error) {
				console.error("Error running overdue payments check:", error);
			}
		},
		{
			timezone: "IST",
		}
	);
};
