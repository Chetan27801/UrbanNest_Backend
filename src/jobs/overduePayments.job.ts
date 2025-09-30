import cron from "node-cron";
import { markPaymentAsOverdue } from "../services/payment.services";

export const scheduleOverduePayments = () => {
	cron.schedule(
		"1 0 * * *",
		async () => {
			try {
				const overdueCount = await markPaymentAsOverdue();
			} catch (error) {
				console.error("Error running overdue payments check:", error);
			}
		},
		{
			timezone: "IST",
		}
	);
};
