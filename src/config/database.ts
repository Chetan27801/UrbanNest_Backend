import mongoose from "mongoose";

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URL as string);
		console.log("MongoDB connected");
	} catch (error) {
		console.log(error); // eslint-disable-line no-console
		process.exit(1);
	}
};

export default connectDB;
