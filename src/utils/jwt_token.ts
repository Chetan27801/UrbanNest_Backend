import jwt from "jsonwebtoken";

const generateToken = (_id: string, role: string) => {
	const jwtSecret = process.env.JWT_SECRET as string;
	const token = jwt.sign({ _id, role }, jwtSecret, { expiresIn: "1h" });
	return token;
};

export { generateToken };
