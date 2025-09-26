import Conversation from "../models/Conversation.model";
import Message from "../models/Message.model";
import { IMessage, IMessageInput } from "../types/chat.types";
import { getSocketInstance } from "../sockets/index";
import { BroadcastStatus, BroadcastType } from "../types/enums";

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
		})
		.populate({
			path: "lastMessage",
			populate: {
				path: "receiver",
				select: "name avatar",
			},
		});

	if (!conversation) {
		conversation = await Conversation.create({
			participants: [user1Id, user2Id],
		});
	}

	conversation = await conversation.populate({
		path: "lastMessage",
		populate: {
			path: "sender",
			select: "name avatar",
		},
	});
	conversation = await conversation.populate({
		path: "lastMessage",
		populate: {
			path: "receiver",
			select: "name avatar",
		},
	});

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
		.populate({
			path: "lastMessage",
			populate: {
				path: "receiver",
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

	const populatedMessage = await Message.findById(message._id)
		.populate("sender", "name avatar")
		.populate("receiver", "name avatar");

	// Transform _id to id for frontend compatibility
	if (populatedMessage) {
		const messageObj = populatedMessage.toObject();
		if (messageObj.sender && messageObj.sender._id) {
			(messageObj.sender as any).id = messageObj.sender._id.toString();
		}
		if (messageObj.receiver && messageObj.receiver._id) {
			(messageObj.receiver as any).id = messageObj.receiver._id.toString();
		}
		return messageObj;
	}

	return populatedMessage;
};

// ✨ OPTIMIZED: Combined message creation and real-time broadcasting
export const createAndBroadcastMessage = async (
	messageData: IMessageInput,
	options: {
		emitRealTime?: boolean;
		source?: BroadcastType;
		socketId?: string;
	} = {}
) => {
	const {
		emitRealTime = true,
		source = BroadcastType.REST,
		socketId,
	} = options;

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

				// Prepare broadcast data with transformed message
				const broadcastData = {
					...message,
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
			broadcast: emitRealTime
				? BroadcastStatus.Attempted
				: BroadcastStatus.Skipped,
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

	// Transform _id to id for frontend compatibility
	const transformedMessages = messages.map((message) => {
		const messageObj = message.toObject();
		if (messageObj.sender && messageObj.sender._id) {
			(messageObj.sender as any).id = messageObj.sender._id.toString();
		}
		if (messageObj.receiver && messageObj.receiver._id) {
			(messageObj.receiver as any).id = messageObj.receiver._id.toString();
		}
		return messageObj;
	});

	const totalMessages = await Message.countDocuments({
		conversationId: conversationId,
	});
	const totalPages = Math.ceil(totalMessages / limit);
	const hasNextPage = page < totalPages;
	const hasPreviousPage = page > 1;

	return {
		messages: transformedMessages.reverse(),
		pagination: {
			page,
			limit,
			totalPages,
			hasNextPage,
			hasPreviousPage,
			totalMessages,
		},
	};
};

//mark message as read
export const markMessageAsRead = async (
	conversationId: string,
	userId: string
) => {
	return await Message.updateMany(
		{ conversationId, receiver: userId, isRead: false },
		{ isRead: true },
		{
			new: true,
		}
	);
};

// ✨ OPTIMIZED: Combined mark as read + real-time broadcast
export const markAsReadAndBroadcast = async (
	conversationId: string,
	userId: string,
	options: {
		emitRealTime?: boolean;
		source?: BroadcastType;
		socketId?: string;
	} = {}
) => {
	const {
		emitRealTime = true,
		source = BroadcastType.REST,
		socketId,
	} = options;

	try {
		// 1️⃣ Mark messages as read in database
		const result = await markMessageAsRead(conversationId, userId);

		// 🔍 Provide additional context if no messages were marked
		let reason = "";
		if (result.modifiedCount === 0) {
			// Check if user has any unread messages they can mark as read
			const unreadMessagesForUser = await Message.countDocuments({
				conversationId,
				receiver: userId,
				isRead: false,
			});

			if (unreadMessagesForUser === 0) {
				// Check if user is sender of messages in this conversation
				const userSentMessages = await Message.countDocuments({
					conversationId,
					sender: userId,
				});

				if (userSentMessages > 0) {
					reason =
						"No messages to mark as read - you are the sender of messages in this conversation";
				} else {
					reason =
						"No unread messages found for this user in this conversation";
				}
			}
		}

		// 2️⃣ Broadcast read status if enabled
		if (emitRealTime && result.modifiedCount > 0) {
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
			broadcast:
				emitRealTime && result.modifiedCount > 0
					? BroadcastStatus.Attempted
					: BroadcastStatus.Skipped,
			source,
			messagesMarked: result.modifiedCount,
			reason: reason || undefined,
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
