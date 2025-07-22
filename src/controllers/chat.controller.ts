import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/api.Response";
import { IUser } from "../types/user.type";
import User from "../models/User.model";
import { findUserById } from "../services/auth.services";
import {
	getOrCreateConversation as getOrCreateConversationService,
	getConversations as getConversationsService,
	createAndBroadcastMessage,
	isUserInConversation as isUserInConversationService,
	getMessages as getMessagesService,
	markAsReadAndBroadcast,
	getUnreadMessagesCount as getUnreadMessagesCountService,
} from "../services/chat.services";

//----------------------------SOCKET.IO----------------------------
// Socket.IO now handled by markAsReadAndBroadcast service

//----------------------------CONTROLLERS----------------------------

//Start conversation
export const startConversation = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const { otherUserId } = req.body;

		if (!otherUserId) {
			return next(createError("Other user ID is required", 400));
		}

		if (otherUserId === user._id) {
			return next(
				createError("You cannot start a conversation with yourself", 400)
			);
		}

		//check if other user exists
		const otherUser = await User.findById(otherUserId);
		if (!otherUser) {
			return next(createError("Other user not found", 404));
		}

		///Ensume it's between landlord and tenant
		if (user.role === otherUser.role) {
			return next(
				createError("You cannot start a conversation with yourself", 400)
			);
		}

		if (user.role === otherUser.role) {
			return next(
				createError("Conversation between same role users is not allowed", 400)
			);
		}

		const conversation = await getOrCreateConversationService(
			user._id,
			otherUserId
		);

		res.status(200).json({
			success: true,
			message: "Conversation started successfully",
			conversation,
		});
	} catch (error) {
		next(createError("Internal Server Error", 500, String(error)));
	}
};

//Get conversations
export const getConversations = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const conversations = await getConversationsService(user._id);

		res.status(200).json({
			success: true,
			message: "Conversations fetched successfully",
			conversations,
		});
	} catch (error) {
		next(createError("Internal Server Error", 500, String(error)));
	}
};

//send message
export const sendMessage = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const { conversationId, receiverId, content } = req.body;

		if (!conversationId || !content || !receiverId) {
			return next(
				createError(
					"Conversation ID, receiver ID and content are required",
					400
				)
			);
		}

		console.log("🌐 REST API: Sending message:", {
			conversationId,
			sender: user._id,
			receiver: receiverId,
			content: content.substring(0, 50) + "...",
			timestamp: new Date().toISOString(),
		});

		// Use optimized shared service
		const result = await createAndBroadcastMessage(
			{
				conversationId,
				sender: user._id,
				receiver: receiverId,
				content,
			},
			{
				emitRealTime: true,
				source: "rest",
			}
		);

		console.log("✅ REST API: Message sent successfully");

		res.status(201).json({
			success: true,
			message: "Message sent successfully",
			data: {
				message: result.message,
				broadcast: result.broadcast,
				source: result.source,
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error) {
		next(createError("Internal Server Error", 500, String(error)));
	}
};

//get messages
export const getMessages = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const { conversationId } = req.params;
		const { page = 1, limit = 10 } = req.query;

		//check if user is a part of this conversation
		const isUserInConversation = await isUserInConversationService(
			conversationId,
			user._id
		);

		if (!isUserInConversation) {
			return next(createError("You are not a part of this conversation", 403));
		}

		const messages = await getMessagesService(
			conversationId,
			Number(page),
			Number(limit)
		);

		res.status(200).json({
			success: true,
			message: "Messages fetched successfully",
			data: messages,
		});
	} catch (error) {
		next(createError("Internal Server Error", 500, String(error)));
	}
};

//mark message as read
export const markMessageAsRead = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const { conversationId } = req.params;

		//check if user is a part of this conversation
		const isUserInConversation = await isUserInConversationService(
			conversationId,
			user._id
		);

		if (!isUserInConversation) {
			return next(createError("You are not a part of this conversation", 403));
		}

		console.log("🌐 REST API: Marking messages as read:", {
			conversationId,
			userId: user._id,
			timestamp: new Date().toISOString(),
		});

		// Use optimized shared service
		const result = await markAsReadAndBroadcast(conversationId, user._id, {
			emitRealTime: true,
			source: "rest",
		});

		console.log("✅ REST API: Messages marked as read successfully");

		res.status(200).json({
			success: true,
			message: "Messages marked as read successfully",
			data: {
				messagesMarked: result.messagesMarked,
				broadcast: result.broadcast,
				source: result.source,
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error) {
		next(createError("Internal Server Error", 500, String(error)));
	}
};

//get unread messages count
export const getUnreadMessagesCount = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user as IUser;
		const count = await getUnreadMessagesCountService(user._id);

		res.status(200).json({
			success: true,
			message: "Unread messages count fetched successfully",
			data: { unreadCount: count },
		});
	} catch (error) {
		next(createError("Internal Server Error", 500, String(error)));
	}
};
