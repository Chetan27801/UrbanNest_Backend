//adding dotenv to the top of the file
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/database";
import passport from "./config/passport";

//Middleware imports
import errorMiddleware from "./middleware/error.middleware";

//Routes imports
import authRouter from "./routes/auth.routes";
import propertyRouter from "./routes/property.routes";

const app = express();
app.use(express.json());

//Initialize passport
app.use(passport.initialize());

// Connect to MongoDB
connectDB();

app.get("/test", (req, res) => {
	res.send("Hello World");
});

//Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/properties", propertyRouter);

//Error handling middleware
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});
