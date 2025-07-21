import { Types } from "mongoose";

export interface IMessage {
	conversationId: Types.ObjectId;
	sender: Types.ObjectId;
	receiver: Types.ObjectId;
	content: string;
	isRead: boolean;
}

export interface IConversation {
	participants: Types.ObjectId[];
	lastMessage: Types.ObjectId;
}
