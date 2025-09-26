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
	authMiddleware(["tenant", "landlord", "admin"]),
	startConversation
);
router.get(
	"/all-conversations",
	authMiddleware(["tenant", "landlord", "admin"]),
	getConversations
);
router.post(
	"/send-message",
	authMiddleware(["tenant", "landlord", "admin"]),
	sendMessage
);
router.get(
	"/conversation/messages/:conversationId",
	authMiddleware(["tenant", "landlord", "admin"]),
	getMessages
);
router.put(
	"/mark-as-read/:conversationId",
	authMiddleware(["tenant", "landlord", "admin"]),
	markMessageAsRead
);
router.get(
	"/unread-count",
	authMiddleware(["tenant", "landlord", "admin"]),
	getUnreadMessagesCount
);

export default router;
