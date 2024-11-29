/**
 * @swagger
 * tags:
 *  name: Messages WebSocket Events
 *  description: The  Managing API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PIN_MESSAGE_CLIENT:
 *       type: object
 *       description: Event sent from the client to the server to pin a message in a chat.
 *       properties:
 *         chatId:
 *           type: string
 *           description: The ID of the chat where the message is being pinned
 *           example: "12345"
 *         messageId:
 *           type: string
 *           description: The ID of the message to be pinned
 *           example: "67890"
 *         userId:
 *           type: string
 *           description: The ID of the user performing the action
 *           example: "98765"
 *     PIN_MESSAGE_SERVER:
 *       type: object
 *       description: Event sent from the server to the client to confirm or notify that a message has been pinned in a chat.
 *       properties:
 *         chatId:
 *           type: string
 *           description: The ID of the chat where the message is being pinned
 *           example: "12345"
 *         messageId:
 *           type: string
 *           description: The ID of the message to be pinned
 *           example: "67890"
 *         userId:
 *           type: string
 *           description: The ID of the user performing the action
 *           example: "98765"
 *
 * tags:
 *   - name: Messages WebSocket Events
 *     description: Events for real-time communication using WebSockets.
 *
 * Example Usage:
 *   Client to Server:
 *     event: "PIN_MESSAGE_CLIENT"
 *     payload: { "chatId": "12345", "messageId": "67890", "userId": "98765" }
 *   Server to Client:
 *     event: "PIN_MESSAGE_SERVER"
 *     payload: { "chatId": "12345", "messageId": "67890", "userId": "98765" }
 */
