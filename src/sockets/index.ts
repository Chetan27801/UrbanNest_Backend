import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { socketAuthMiddleware } from "../middleware/socket.middleware";
import { setupChatHandlers } from "./chat.handler";

let io: Server;

export const initializeSocketServer = (server: HTTPServer) => {
	io = new Server(server, {
		cors: {
			origin: process.env.CLIENT_URL,
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			credentials: true,
		},
	});

	// Apply authentication middleware
	io.use(socketAuthMiddleware as any);

	// Setup event handlers
	io.on("connection", (socket) => {
		const user = socket.data.user;

		if (!user) {
			return socket.disconnect();
		}

		console.log(`New User connected: ${user._id}`, socket.id);

		// Setup chat handlers
		setupChatHandlers(io, socket, user);
	});

	console.log("Socket.IO server initialized");
	return io;
};

export const getSocketInstance = () => {
	if (!io) {
		throw new Error(
			"Socket.IO server not initialized. Call initializeSocketServer first."
		);
	}
	return io;
};

export { io };
