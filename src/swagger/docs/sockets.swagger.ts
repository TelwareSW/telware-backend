/**
 * @swagger
 * tags:
 *  name: Sockets
 *  description: The Sockets Managing API
 */

/**
 * @swagger
 * /SEND_MESSAGE:
 *   post:
 *     summary: Sends a message in a chat room.
 *     description: This endpoint handles sending a message. If it's the user's first message in the chat, a new chat room will be created. The message will be saved and broadcast to the other members of the chat.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - contentType
 *               - senderId
 *               - chatId
 *               - chatType
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the message. For example, text or other data types.
 *               contentType:
 *                 type: string
 *                 description: The type of the message content (e.g., "text", "image", "video").
 *               senderId:
 *                 type: string
 *                 description: The unique ID of the sender.
 *               chatId:
 *                 type: string
 *                 description: The unique ID of the chat. This will be used to route the message to the right room.
 *               isFirstTime:
 *                 type: boolean
 *                 description: Flag indicating if this is the first message in the chat. If true, a new chat will be created.
 *               chatType:
 *                 type: string
 *                 description: The type of the chat (e.g., "private", "group", "channel").
 *               media:
 *                 type: string
 *                 description: Optional media content attached to the message (e.g., image URL, video link).
 *     responses:
 *       200:
 *         description: Successfully sent the message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A success message describing the result.
 *                   example: "Message sent successfully."
 *                 res:
 *                   type: object
 *                   description: Additional data for a successful operation, including the message ID.
 *                   properties:
 *                     messageId:
 *                       type: string
 *                       description: The unique ID of the message that was sent.
 *                       example: "5f1d7e7d2c8b961a8f56b0de"
 *       400:
 *         description: Missing required fields or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: An error message describing the issue.
 *                   example: "Failed to send the message"
 *                 error:
 *                   type: string
 *                   description: The error reason (e.g., "missing required Fields").
 *                   example: "missing required Fields"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: A message describing the result.
 *                   example: "Internal server error."
 *                 error:
 *                   type: string
 *                   description: Details about the error.
 *                   example: "Database save failed"
 */

/**
 * @swagger
 * /EDIT_MESSAGE:
 *   patch:
 *     summary: Edits an existing message in the chat.
 *     description: Edits an existing message in the chat. It is not possible to edit forwarded messages.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *               - content
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: The unique ID of the message to be edited.
 *                 example: "5f1d7e7d2c8b961a8f56b0de"
 *               content:
 *                 type: string
 *                 description: The new content to replace the old message content.
 *                 example: "Updated message content."
 *               chatId:
 *                 type: string
 *                 description: The unique ID of the chat where the message exists.
 *                 example: "5f1d7e7d2c8b961a8f56b0ab"
 *     responses:
 *       200:
 *         description: Message edited successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A message describing the result of the edit operation.
 *                   example: "Message edited successfully."
 *                 res:
 *                   type: object
 *                   description: The updated message object.
 *                   properties:
 *                     message:
 *                       type: object
 *                       description: The updated message.
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: The unique ID of the message.
 *                         content:
 *                           type: string
 *                           description: The updated content of the message.
 *                         isForward:
 *                           type: boolean
 *                           description: Whether the message is forwarded.
 *                           example: false
 *                         chatId:
 *                           type: string
 *                           description: The unique ID of the chat.
 *       400:
 *         description: Invalid input or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: A message explaining the error.
 *                   example: "Failed to edit the message."
 *                 error:
 *                   type: string
 *                   description: Details about the error (e.g., missing fields).
 *                   example: "missing required Fields"
 *       404:
 *         description: Message not found or cannot be edited (e.g., forwarded message).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: A message explaining why the message could not be edited.
 *                   example: "Message not found or is a forwarded message."
 *                 error:
 *                   type: string
 *                   description: Specific error details (e.g., "no message found", "cannot edit forwarded message").
 *                   example: "cannot edit a forwarded message"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: A message describing the result.
 *                   example: "Internal server error."
 *                 error:
 *                   type: string
 *                   description: Details about the error.
 *                   example: "Database update failed."
 */

/**
 * @swagger
 * /REPLY_MESSAGE:
 *   post:
 *     summary: Replies to a Message.
 *     description: Sends a reply to an existing message in the chat. This creates a new message as a reply to the specified parent message. The reply is linked to the parent message, and in the case of a channel, it will be added as a thread message.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - contentType
 *               - senderId
 *               - chatId
 *               - parentMessageId
 *               - chatType
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the reply message.
 *               contentType:
 *                 type: string
 *                 description: The type of content (e.g., "text", "image").
 *               senderId:
 *                 type: string
 *                 description: The unique ID of the sender.
 *               chatId:
 *                 type: string
 *                 description: The unique ID of the chat.
 *               parentMessageId:
 *                 type: string
 *                 description: The unique ID of the parent message being replied to.
 *               chatType:
 *                 type: string
 *                 enum: [private, group, channel]
 *                 description: The type of the chat (e.g., "private", "group", "channel").
 *     responses:
 *       200:
 *         description: Reply sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A message describing the result of the reply operation.
 *                   example: "Reply sent successfully."
 *                 res:
 *                   type: object
 *                   description: The result of the reply operation, containing the message ID.
 *                   properties:
 *                     messageId:
 *                       type: string
 *                       description: The unique ID of the reply message.
 *                       example: "5f2d7e7d2c8b961a8f56b0cd"
 *       400:
 *         description: Missing required fields or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: An error message describing the problem.
 *                   example: "Failed to send the message."
 *                 error:
 *                   type: string
 *                   description: Details about the error (e.g., missing fields).
 *                   example: "missing required Fields"
 *       404:
 *         description: Parent message not found or failed to create the reply.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: An error message explaining the failure.
 *                   example: "No message found with the provided parent message id"
 *                 error:
 *                   type: string
 *                   description: Details about the error (e.g., "parent message not found").
 *                   example: "No message found with the provided parent message id"
 */

/**
 * @swagger
 * /DELETE_MESSAGE:
 *   delete:
 *     summary: Deletes a Message.
 *     description: Deletes a message from the chat based on the provided message ID. If the message is found, it is deleted from the chat.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: The unique ID of the message to be deleted.
 *     responses:
 *       200:
 *         description: Message deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A message describing the result of the deletion.
 *                   example: "Message deleted successfully."
 *       400:
 *         description: Missing required fields or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: An error message describing the problem.
 *                   example: "Failed to delete the message."
 *                 error:
 *                   type: string
 *                   description: Details about the error (e.g., missing fields).
 *                   example: "missing required Fields"
 *       404:
 *         description: No message found with the provided ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: A message describing the result.
 *                   example: "Failed to delete the message."
 *                 error:
 *                   type: string
 *                   description: Details about the error (e.g., message not found).
 *                   example: "no message found with the provided id"
 */

/**
 * @swagger
 * /FORWARD_MESSAGE:
 *   post:
 *     summary: Forwards a Message.
 *     description: Forwards an existing message to a new chat. The forwarded message is saved and emitted to the new chat.
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
 *               - senderId
 *               - chatType
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The unique ID of the chat where the message will be forwarded.
 *               messageId:
 *                 type: string
 *                 description: The unique ID of the message to be forwarded.
 *               senderId:
 *                 type: string
 *                 description: The unique ID of the sender.
 *               chatType:
 *                 type: string
 *                 enum: [private, group, channel]
 *                 description: The type of chat (e.g., "private", "group", "channel").
 *     responses:
 *       200:
 *         description: Message forwarded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A message describing the result.
 *                   example: "Message forwarded successfully."
 *                 res:
 *                   type: object
 *                   description: The result of the forward operation, containing the forwarded message ID.
 *                   properties:
 *                     messageId:
 *                       type: string
 *                       description: The unique ID of the forwarded message.
 *                       example: "64b87d2f34e62a3b6d07b8d7"
 *       400:
 *         description: Missing required fields or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: An error message describing the problem.
 *                   example: "Failed to send the message"
 *                 error:
 *                   type: string
 *                   description: Details about the error (e.g., missing fields).
 *                   example: "missing required Fields"
 *       404:
 *         description: No message found with the provided ID or failed to forward the message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: An error message describing the result.
 *                   example: "Failed to forward the message"
 *                 error:
 *                   type: string
 *                   description: Details about the error (e.g., message not found).
 *                   example: "No message found with the provided id"
 */

/**
 * @swagger
 * /UPDATE_DRAFT:
 *   post:
 *     summary: Updates a draft message
 *     description: Updates an existing draft message with new content. The updated draft is saved and the client is notified of the update.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - draftId
 *               - content
 *               - userId
 *             properties:
 *               draftId:
 *                 type: string
 *                 description: The unique ID of the draft to be updated.
 *               content:
 *                 type: string
 *                 description: The new content of the draft.
 *               userId:
 *                 type: string
 *                 description: The unique ID of the user updating the draft.
 *     responses:
 *       200:
 *         description: Draft updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: A message describing the result.
 *                 res:
 *                   type: object
 *                   description: The result of the update operation, containing the updated draft details.
 *                   properties:
 *                     draftId:
 *                       type: string
 *                       description: The unique ID of the updated draft.
 *                     content:
 *                       type: string
 *                       description: The new content of the updated draft.
 *       400:
 *         description: Missing required fields or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: An error message describing the problem.
 *                 error:
 *                   type: string
 *                   description: Details about the error (e.g., missing fields).
 *       404:
 *         description: No draft found with the provided ID or failed to update the draft.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: An error message describing the result.
 *                 error:
 *                   type: string
 *                   description: Details about the error (e.g., draft not found).
 */

/**
 * @swagger
 * /RECEIVE_REPLY:
 *   post:
 *     summary: Receives a reply to a specific message in a chat room.
 *     description: This endpoint handles receiving a reply to a specific message in a chat. The reply will be saved and broadcast to the other members of the chat.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - content
 *               - messageId
 *               - senderId
 *               - parentMsgId
 *               - type
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The unique ID of the chat where the reply is sent.
 *               content:
 *                 type: string
 *                 description: The content of the reply message.
 *               messageId:
 *                 type: string
 *                 description: The unique ID of the message being sent.
 *               senderId:
 *                 type: string
 *                 description: The unique ID of the sender of the reply.
 *               parentMsgId:
 *                 type: string
 *                 description: The unique ID of the message being replied to.
 *               type:
 *                 type: ContentType
 *                 description: The type of the content (e.g., "text", "image", "video").
 *     responses:
 *       200:
 *         description: Successfully received the reply.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A success message describing the result.
 *                   example: "Reply received successfully."
 *                 res:
 *                   type: object
 *                   description: Additional data for a successful operation, including the message ID.
 *                   properties:
 *                     messageId:
 *                       type: string
 *                       description: The unique ID of the reply message.
 *                       example: "5f1d7e7d2c8b961a8f56b0de"
 *       400:
 *         description: Missing required fields or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: An error message describing the issue.
 *                   example: "Failed to receive the reply"
 *                 error:
 *                   type: string
 *                   description: The error reason (e.g., "missing required fields").
 *                   example: "missing required fields"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: A message describing the result.
 *                   example: "Internal server error."
 *                 error:
 *                   type: string
 *                   description: Details about the error.
 *                   example: "Database save failed"
 */

/**
 * @swagger
 * /RECEIVE_MESSAGE:
 *   post:
 *     summary: Receives a message in a chat room.
 *     description: This endpoint handles receiving a message in a chat. The message will be saved and broadcast to the other members of the chat.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - content
 *               - messageId
 *               - senderId
 *               - type
 *               - timestamp
 *               - messageType
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The unique ID of the chat where the message is sent.
 *               content:
 *                 type: string
 *                 description: The content of the message.
 *               messageId:
 *                 type: string
 *                 description: The unique ID of the message being sent.
 *               senderId:
 *                 type: string
 *                 description: The unique ID of the sender of the message.
 *               type:
 *                 type: ContentType
 *                 description: The type of the content (e.g., "text", "image", "video").
 *               timestamp:
 *                 type: string
 *                 description: The timestamp of when the message was sent.
 *               autoDeleteTimeStamp:
 *                 type: string
 *                 nullable: true
 *                 description: The timestamp indicating when the message will be automatically deleted, if applicable.
 *               messageType:
 *                 type: MessageType
 *                 enum:
 *                   - normal
 *                   - announcement
 *                   - forward
 *                 description: The type of the message, such as "normal", "announcement", or "forward".
 *               media:
 *                 type: string
 *                 description: Optional media content attached to the message (e.g., image URL, video link).
 *     responses:
 *       200:
 *         description: Successfully received the message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A success message describing the result.
 *                   example: "Message received successfully."
 *                 res:
 *                   type: object
 *                   description: Additional data for a successful operation, including the message ID.
 *                   properties:
 *                     messageId:
 *                       type: string
 *                       description: The unique ID of the received message.
 *                       example: "5f1d7e7d2c8b961a8f56b0de"
 *       400:
 *         description: Missing required fields or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: An error message describing the issue.
 *                   example: "Failed to receive the message"
 *                 error:
 *                   type: string
 *                   description: The error reason (e.g., "missing required fields").
 *                   example: "missing required fields"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was unsuccessful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: A message describing the result.
 *                   example: "Internal server error."
 *                 error:
 *                   type: string
 *                   description: Details about the error.
 *                   example: "Database save failed"
 */
