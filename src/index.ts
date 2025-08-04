//adding dotenv to the top of the file
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import connectDB from "./config/database";
import passport from "./config/passport";

//Middleware imports
import errorMiddleware from "./middleware/error.middleware";

//Routes imports
import authRouter from "./routes/auth.routes";
import propertyRouter from "./routes/property.routes";
import statsRouter from "./routes/stats.routes";
import paymentRouter from "./routes/payment.routes";
import leaseRouter from "./routes/lease.routes";
import applicationRouter from "./routes/application.routes";
import chatRouter from "./routes/chat.routes";
import userRouter from "./routes/user.routes";

//Socket.IO setup
import { initializeSocketServer } from "./sockets/index";

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server
initializeSocketServer(server);

app.use(
	cors({
		origin: process.env.CLIENT_URL,
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Initialize passport
app.use(passport.initialize());

// Connect to MongoDB
connectDB();

app.get("/test", (req, res) => {
	res.send("Hello World");
});

//Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/properties", propertyRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/leases", leaseRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/stats", statsRouter);
app.use("/api/v1/chat", chatRouter);

//Error handling middleware
app.use(errorMiddleware);

server.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
	console.log(`Socket.IO server is ready for real-time chat`);
});
