import { Schema, model } from "mongoose";
import { IConversation } from "../types/chat.types";

const conversationSchema = new Schema<IConversation>(
	{
		participants: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
		],
		lastMessage: {
			type: Schema.Types.ObjectId,
			ref: "Message",
		},
	},
	{
		timestamps: true,
	}
);

const Conversation = model("Conversation", conversationSchema);

export default Conversation;
