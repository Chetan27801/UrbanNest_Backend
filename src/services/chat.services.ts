import Conversation from "../models/Conversation.model";
import Message from "../models/Message.model";
import { IMessage, IMessageInput } from "../types/chat.types";
import { getSocketInstance } from "../sockets/index";

//get or create conversation between two users
export const getOrCreateConversation = async (
	user1Id: string,
	user2Id: string
) => {
	let conversation = await Conversation.findOne({
		participants: {
			$all: [user1Id, user2Id],
		},
	})
		.populate("participants", "name email role avatar")
		.populate({
			path: "lastMessage",
			populate: {
				path: "sender",
				select: "name avatar",
			},
		});

	if (!conversation) {
		conversation = await Conversation.create({
			participants: [user1Id, user2Id],
		});
		await conversation.populate("participants", "name email role avatar");
	}

	return conversation;
};

//get all conversations for a user
export const getConversations = async (userId: string) => {
	return await Conversation.find({
		participants: userId,
	})
		.populate("participants", "name email role avatar")
		.populate({
			path: "lastMessage",
			populate: {
				path: "sender",
				select: "name avatar",
			},
		})
		.sort({ updatedAt: -1 });
};

///create a new message
export const createMessage = async (messageData: IMessageInput) => {
	const message = await Message.create(messageData);

	//update conversation last message
	await Conversation.findByIdAndUpdate(messageData.conversationId, {
		lastMessage: message._id,
		updatedAt: Date.now(),
	});

	return await Message.findById(message._id)
		.populate("sender", "name avatar")
		.populate("receiver", "name avatar");
};

// ✨ OPTIMIZED: Combined message creation and real-time broadcasting
export const createAndBroadcastMessage = async (
	messageData: IMessageInput,
	options: {
		emitRealTime?: boolean;
		source?: "socket" | "rest";
		socketId?: string;
	} = {}
) => {
	const { emitRealTime = true, source = "rest", socketId } = options;

	try {
		// Create message in database
		const message = await createMessage(messageData);

		if (!message) {
			throw new Error("Failed to create message in database");
		}

		// Send real-time notification if enabled
		if (emitRealTime) {
			try {
				const io = getSocketInstance();

				// Prepare broadcast data
				const broadcastData = {
					...message.toObject(),
					conversationId: messageData.conversationId,
					timestamp: new Date().toISOString(),
					source, // Track if message came from socket or REST
				};

				// Send to both participants
				io.to(messageData.sender)
					.to(messageData.receiver)
					.emit("newMessage", broadcastData);

				console.log(`📡 Real-time message broadcast successful (${source})`, {
					messageId: message._id,
					from: messageData.sender,
					to: messageData.receiver,
					conversationId: messageData.conversationId,
				});
			} catch (socketError) {
				console.warn("❌ Socket.IO broadcast failed:", socketError);
				// Don't throw error - message was still saved to database
				// This ensures graceful degradation when Socket.IO fails
			}
		}

		return {
			message,
			broadcast: emitRealTime ? "attempted" : "skipped",
			source,
		};
	} catch (error) {
		console.error("💥 Message creation failed:", error);
		throw error;
	}
};

//get messages for a conversation with pagination
export const getMessages = async (
	conversationId: string,
	page: number,
	limit: number
) => {
	const skip = (page - 1) * limit;
	const messages = await Message.find({
		conversationId: conversationId,
	})
		.populate("sender", "name avatar")
		.populate("receiver", "name avatar")
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit);

	return messages.reverse(); //reverse the messages to get the latest messages first
};

//mark message as read
export const markMessageAsRead = async (
	conversationId: string,
	userId: string
) => {
	return await Message.updateMany(
		{ conversationId, receiver: userId, isRead: false },
		{ isRead: true }
	);
};

// ✨ OPTIMIZED: Combined mark as read + real-time broadcast
export const markAsReadAndBroadcast = async (
	conversationId: string,
	userId: string,
	options: {
		emitRealTime?: boolean;
		source?: "socket" | "rest";
		socketId?: string;
	} = {}
) => {
	const { emitRealTime = true, source = "rest", socketId } = options;

	try {
		// 1️⃣ Mark messages as read in database
		const result = await markMessageAsRead(conversationId, userId);

		// 2️⃣ Broadcast read status if enabled
		if (emitRealTime) {
			try {
				const io = getSocketInstance();

				// Notify other participants that messages were read
				io.to(conversationId).emit("messageRead", {
					conversationId,
					readBy: userId,
					timestamp: new Date().toISOString(),
					source,
					readCount: result.modifiedCount, // How many messages were marked as read
				});

				console.log(`📖 Read status broadcast successful (${source})`, {
					conversationId,
					readBy: userId,
					messagesMarked: result.modifiedCount,
				});
			} catch (socketError) {
				console.warn("❌ Read status broadcast failed:", socketError);
				// Continue - messages still marked as read in database
			}
		}

		return {
			result,
			broadcast: emitRealTime ? "attempted" : "skipped",
			source,
			messagesMarked: result.modifiedCount,
		};
	} catch (error) {
		console.error("💥 Mark as read failed:", error);
		throw error;
	}
};

//get unread messages count
export const getUnreadMessagesCount = async (userId: string) => {
	return await Message.countDocuments({
		receiver: userId,
		isRead: false,
	});
};

//Check if user is in conversation
export const isUserInConversation = async (
	conversationId: string,
	userId: string
) => {
	const conversation = await Conversation.findOne({
		_id: conversationId,
		participants: userId,
	});

	return !!conversation;
};
