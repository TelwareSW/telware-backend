/**
 * @swagger
 * tags:
 *  name: Sockets
 *  description: The Sockets Managing API
 */

/**
 * @swagger
 * /PIN_MESSAGE_CLIENT:
 *   post:
 *     summary: Pins a message in a chat.
 *     description: Marks a specific message as pinned in a chat. The pinned message information is sent to the server.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - messageId
 *               - userId
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The unique ID of the chat where the message will be pinned.
 *               messageId:
 *                 type: string
 *                 description: The unique ID of the message to be pinned.
 *               userId:
 *                 type: string
 *                 description: The unique ID of the user performing the action.
 *                 example: "98765"
 */

/**
 * @swagger
 * /UNPIN_MESSAGE_CLIENT:
 *   post:
 *     summary: unpins a message in a chat.
 *     description: Change a pinned message to be unpinned. The message information is sent to the server.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - messageId
 *               - userId
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The unique ID of the chat where the message will be unpinned.
 *               messageId:
 *                 type: string
 *                 description: The unique ID of the message to be unpinned.
 *               userId:
 *                 type: string
 *                 description: The unique ID of the user performing the action.
 *                 example: "98765"
 */

/**
 * @swagger
 * /PIN_MESSAGE_SERVER:
 *   post:
 *     summary: Notifies clients about a pinned message in a chat.
 *     description: Sends information to clients that a specific message has been pinned in a chat.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - messageId
 *               - userId
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The unique ID of the chat where the message was pinned.
 *               messageId:
 *                 type: string
 *                 description: The unique ID of the message that was pinned.
 *               userId:
 *                 type: string
 *                 description: The unique ID of the user who performed the action.
 *                 example: "98765"
 */

/**
 * @swagger
 * /UNPIN_MESSAGE_SERVER:
 *   post:
 *     summary: Notifies clients about an unpinned message in a chat.
 *     description: Sends information to clients that a specific message has been unpinned in a chat.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - messageId
 *               - userId
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The unique ID of the chat where the message was unpinned.
 *               messageId:
 *                 type: string
 *                 description: The unique ID of the message that was unpinned.
 *               userId:
 *                 type: string
 *                 description: The unique ID of the user who performed the action.
 *                 example: "98765"
 */
