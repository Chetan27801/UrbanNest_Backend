import { Types } from "mongoose";

export interface IMessage {
	conversationId: Types.ObjectId;
	sender: Types.ObjectId;
	receiver: Types.ObjectId;
	content: string;
	isRead: boolean;
}

export interface IMessageInput {
	conversationId: string;
	sender: string;
	receiver: string;
	content: string;
}

export interface IConversation {
	participants: Types.ObjectId[];
	lastMessage: Types.ObjectId;
}
