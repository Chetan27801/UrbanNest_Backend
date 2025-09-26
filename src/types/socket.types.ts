export interface SocketMessage {
	conversationId: string;
	sender: string;
	receiver: string;
	content: string;
}

export interface TypingData {
	conversationId: string;
	sender: string;
	receiver: string;
	isTyping: boolean;
	timestamp?: string;
}

export interface MessageReadData {
	conversationId: string;
	readBy: string;
	timestamp: string;
	source: "socket" | "rest";
	readCount: number;
}

export interface MarkAsReadRequest {
	conversationId: string;
}

export interface MarkAsReadAck {
	success: boolean;
	conversationId: string;
	messagesMarked: number;
	source: "socket" | "rest";
	broadcast: "attempted" | "skipped";
}

export interface MarkAsReadError {
	message: string;
	code: string;
	conversationId?: string;
	error?: string;
}

export interface UserStatusUpdate {
	userId: string;
	status: "online" | "away" | "busy" | "offline";
	timestamp: string;
}

export interface ConnectionResponse {
	message: string;
	userId: string;
	socketId: string;
}

export interface MessageAck {
	success: boolean;
	messageId: string;
	conversationId: string;
	source: "socket" | "rest";
	broadcast: "attempted" | "skipped";
}

export interface SocketError {
	message: string;
	code: string;
	error?: string;
}

export enum SocketEventTypes {
	JoinRoom = "joinRoom",
	Connected = "connected",
	Error = "error",
	SendMessage = "sendMessage",
	NewMessage = "newMessage",
	MessageAck = "messageAck",
	MessageError = "messageError",
	Typing = "typing",
	UserStatusUpdate = "userStatusUpdate",
	Disconnect = "disconnect",
	ConnectError = "connect_error",
}
