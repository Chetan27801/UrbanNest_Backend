import { Router } from "express";
import {
	markMessageAsRead,
	getUnreadMessagesCount,
	getMessages,
	sendMessage,
	getConversations,
	startConversation,
} from "../controllers/chat.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.post(
	"/conversation",
	authMiddleware(["tenant", "landlord"]),
	startConversation
);
router.get(
	"/all-conversations",
	authMiddleware(["tenant", "landlord"]),
	getConversations
);
router.post(
	"/send-message",
	authMiddleware(["tenant", "landlord"]),
	sendMessage
);
router.get(
	"/conversation/messages/:conversationId",
	authMiddleware(["tenant", "landlord"]),
	getMessages
);
router.put(
	"/mark-as-read/:conversationId",
	authMiddleware(["tenant", "landlord"]),
	markMessageAsRead
);
router.get(
	"/unread-count",
	authMiddleware(["tenant", "landlord"]),
	getUnreadMessagesCount
);

export default router;
