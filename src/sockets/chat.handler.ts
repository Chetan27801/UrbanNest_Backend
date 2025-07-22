import { Server, Socket } from "socket.io";
import {
	createAndBroadcastMessage,
	markAsReadAndBroadcast,
	isUserInConversation,
} from "../services/chat.services";
import { IUser } from "../types/user.type";

export const setupChatHandlers = (io: Server, socket: Socket, user: IUser) => {
	// Auto-join user to their own room
	socket.join(user._id);

	// Handle manual room joining
	socket.on("joinRoom", (userId: string) => {
		// Verify user can only join their own room for security
		if (userId === user._id) {
			socket.join(userId);
			console.log(`User ${user._id} joined room ${userId}`);

			// Notify user they're connected
			socket.emit("connected", {
				message: "You are connected to the server",
				userId: user._id,
				socketId: socket.id,
			});
		} else {
			socket.emit("error", {
				message: "Cannot join another user's room",
				code: "UNAUTHORIZED_ROOM_JOIN",
			});
		}
	});

	// Handle real-time message sending
	socket.on("sendMessage", async (data) => {
		try {
			const { conversationId, sender, receiver, content } = data;

			// Verify sender matches authenticated user
			if (sender !== user._id) {
				socket.emit("messageError", {
					message: "Unauthorized: Cannot send message as another user",
					code: "UNAUTHORIZED_SENDER",
				});
				return;
			}

			console.log("🚀 Socket.IO: Sending message:", {
				conversationId,
				sender,
				receiver,
				content: content.substring(0, 50) + "...",
				timestamp: new Date().toISOString(),
			});

			// Use optimized shared service
			const result = await createAndBroadcastMessage(
				{
					conversationId,
					sender,
					receiver,
					content,
				},
				{
					emitRealTime: true,
					source: "socket",
					socketId: socket.id,
				}
			);

			console.log("✅ Socket.IO: Message sent successfully");

			// Send acknowledgment to sender
			socket.emit("messageAck", {
				success: true,
				messageId: result.message._id,
				conversationId,
				source: result.source,
				broadcast: result.broadcast,
			});
		} catch (error) {
			console.error("❌ Socket.IO message error:", error);
			socket.emit("messageError", {
				message: "Failed to send message",
				error: String(error),
				code: "MESSAGE_SEND_FAILED",
			});
		}
	});

	// Handle user typing indicator
	socket.on("typing", (data) => {
		try {
			const { conversationId, sender, receiver, isTyping } = data;

			// Verify sender matches authenticated user
			if (sender !== user._id) {
				return;
			}

			socket.to(receiver).emit("typing", {
				conversationId,
				sender,
				isTyping,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			console.error("Typing indicator error:", error);
		}
	});

	// Handle mark messages as read
	socket.on("markAsRead", async (data) => {
		try {
			const { conversationId } = data;

			// Verify user is part of the conversation
			const isUserInChat = await isUserInConversation(conversationId, user._id);
			if (!isUserInChat) {
				socket.emit("markAsReadError", {
					message: "You are not part of this conversation",
					code: "UNAUTHORIZED_CONVERSATION",
					conversationId,
				});
				return;
			}

			console.log("🚀 Socket.IO: Marking messages as read:", {
				conversationId,
				userId: user._id,
				timestamp: new Date().toISOString(),
			});

			// Use optimized shared service
			const result = await markAsReadAndBroadcast(conversationId, user._id, {
				emitRealTime: true,
				source: "socket",
				socketId: socket.id,
			});

			console.log("✅ Socket.IO: Messages marked as read successfully");

			// Send acknowledgment to sender
			socket.emit("markAsReadAck", {
				success: true,
				conversationId,
				messagesMarked: result.messagesMarked,
				source: result.source,
				broadcast: result.broadcast,
			});
		} catch (error) {
			console.error("❌ Socket.IO mark as read error:", error);
			socket.emit("markAsReadError", {
				message: "Failed to mark messages as read",
				error: String(error),
				code: "MARK_AS_READ_FAILED",
			});
		}
	});

	// Handle user going online/offline status
	socket.on("updateStatus", (data) => {
		try {
			const { status } = data; // 'online', 'away', 'busy', 'offline'

			// Broadcast status to relevant users (can be enhanced based on your needs)
			socket.broadcast.emit("userStatusUpdate", {
				userId: user._id,
				status,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			console.error("Status update error:", error);
		}
	});

	// Handle user disconnect
	socket.on("disconnect", (reason) => {
		console.log(
			`User disconnected: ${user._id} (${socket.id}) - Reason: ${reason}`
		);

		// Notify other users that this user went offline
		socket.broadcast.emit("userStatusUpdate", {
			userId: user._id,
			status: "offline",
			timestamp: new Date().toISOString(),
		});
	});

	// Handle connection errors
	socket.on("connect_error", (error) => {
		console.error("Connection error for user:", user._id, error);
	});
};
