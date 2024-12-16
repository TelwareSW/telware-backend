/**
 * @swagger
 * tags:
 *  name: Sockets
 *  description: The Sockets Managing API
 */

/**
 * @swagger
 * SEND_MESSAGE:
 *   post:
 *     summary: Handle messaging functionality, including creating chats, replying, and forwarding messages.
 *     tags:
 *       - Sockets
 *     description: This function handles message creation, chat initiation, replying, and forwarding. It also validates required fields and manages conflicting scenarios.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The ID of the chat.
 *               media:
 *                 type: string
 *                 nullable: true
 *                 description: Media content associated with the message.
 *               content:
 *                 type: string
 *                 nullable: true
 *                 description: The text content of the message.
 *               contentType:
 *                 type: string
 *                 enum: [text, image, video, file]
 *                 description: Type of the content being sent.
 *               parentMessageId:
 *                 type: string
 *                 nullable: true
 *                 description: ID of the parent message for reply or forward.
 *               isFirstTime:
 *                 type: boolean
 *                 description: Indicates whether the chat is being initiated for the first time.
 *               chatType:
 *                 type: string
 *                 enum: [group, direct, channel]
 *                 description: Type of the chat.
 *               isReply:
 *                 type: boolean
 *                 description: Indicates if the message is a reply.
 *               isForward:
 *                 type: boolean
 *                 description: Indicates if the message is forwarded.
 *     responses:
 *       200:
 *         description: Message sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message sent successfully
 *                 res:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                       description: The ID of the sent message.
 *       400:
 *         description: Bad request due to missing or conflicting fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to send the message
 *                 error:
 *                   type: string
 *                   example: missing required Fields
 *       404:
 *         description: Parent message not found or invalid chat configuration.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to send the message
 *                 error:
 *                   type: string
 *                   example: No message found with the provided id or Invalid chat configuration
 *       403:
 *         description: Insufficient permissions to send the message (e.g., chat type restrictions or role restrictions).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to send the message
 *                 error:
 *                   type: string
 *                   example: Only admins can post to this channel or Only admins can post and reply to this chat
 */

/**
 * @swagger
 * EDIT_MESSAGE_CLIENT:
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
 * DELETE_MESSAGE_CLIENT:
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
 * UPDATE_DRAFT_CLIENT:
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
 *               - chatId
 *               - content
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The unique ID of the chat to update its draft.
 *               content:
 *                 type: string
 *                 description: The new content of the draft.
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
 */

/**
 * @swagger
 * CREATE_PRIVATE_CHAT:
 *   post:
 *     summary: "Create a new private chat"
 *     description: "This socket event allows a user to create a new private chat. It validates the user's existence and establishes a one-to-one chat."
 *     tags:
 *       - Sockets
 *     operationId: "createPrivateChat"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId:
 *                 type: string
 *                 description: "ID of the user to be added as the other member of the private chat."
 *             required:
 *               - memberId
 *     responses:
 *       200:
 *         description: "Private chat created successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Chat created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: "ID of the newly created private chat."
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user:
 *                             type: string
 *                             description: "ID of the user."
 *                           Role:
 *                             type: string
 *                             description: "Role of the user in the private chat (e.g., 'member')."
 *       400:
 *         description: "Invalid input or constraints violated."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to create the chat."
 *                 error:
 *                   type: string
 *                   description: "Error message describing the issue."
 */

/**
 * @swagger
 * CREATE_GROUP_CHANNEL:
 *   post:
 *     summary: "Create a new group channel"
 *     description: "This socket event allows a user to create a new group channel. It validates the user's login status, group size, and adds members with roles."
 *     tags:
 *       - Sockets
 *     operationId: "createGroupChannel"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [group, otherType]
 *                 description: "Type of the channel (e.g., 'group')."
 *               name:
 *                 type: string
 *                 description: "Name of the group channel."
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Array of user IDs to be added as members."
 *             required:
 *               - type
 *               - name
 *               - members
 *     responses:
 *       200:
 *         description: "Group channel created successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Chat created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: "ID of the newly created group channel."
 *                     name:
 *                       type: string
 *                       description: "Name of the group channel."
 *                     type:
 *                       type: string
 *                       description: "Type of the group channel."
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user:
 *                             type: string
 *                             description: "ID of the user."
 *                           Role:
 *                             type: string
 *                             description: "Role of the user in the group (e.g., 'admin', 'member')."
 *       400:
 *         description: "Invalid input or constraints violated."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to create the chat."
 *                 error:
 *                   type: string
 *                   description: "Error message describing the issue."
 */

/**
 * @swagger
 * DELETE_GROUP_CHANNEL_CLIENT:
 *   delete:
 *     summary: "Delete a group or channel"
 *     description: "This socket event allows the admin of a group channel to delete the group. All members will be informed about the deletion."
 *     tags:
 *       - Sockets
 *     operationId: "deleteGroupChannel"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: "The unique ID of the group channel to be deleted."
 *             required:
 *               - chatId
 *     responses:
 *       200:
 *         description: "Group channel deleted successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Chat deleted successfully."
 *                 data:
 *                   type: string
 *                   description: "The ID of the deleted group channel."
 *       400:
 *         description: "Group deletion failed due to invalid input or unauthorized access."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Could not delete the group."
 *                 error:
 *                   type: string
 *                   description: "Error message describing the issue."
 */

/**
 * @swagger
 * LEAVE_GROUP_CHANNEL_CLIENT:
 *   delete:
 *     summary: "Leave a group channel"
 *     description: "Allows a user to leave a group channel. Other members in the group will be notified of the member's departure."
 *     tags:
 *       - Sockets
 *     operationId: "leaveGroupChannel"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: "The unique ID of the group channel the user wants to leave."
 *             required:
 *               - chatId
 *     responses:
 *       200:
 *         description: "Successfully left the group."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Left the group successfully."
 *                 data:
 *                   type: object
 *                   description: "Additional data (if any)."
 *       400:
 *         description: "Failed to leave the group due to invalid input or authorization issues."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Could not leave the group."
 *                 error:
 *                   type: string
 *                   description: "Detailed error message."
 */

/**
 * @swagger
 * ADD_ADMINS_CLIENT:
 *   patch:
 *     summary: "Add admins to a group chat"
 *     description: "Allows the creator or an authorized admin of a group chat to promote members to admin role."
 *     tags:
 *       - Sockets
 *     operationId: "addAdmins"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: "The unique ID of the group chat where members will be promoted to admin."
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: "User ID of the member to be promoted to admin."
 *             required:
 *               - chatId
 *               - members
 *     responses:
 *       200:
 *         description: "Successfully added admins to the group chat."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Added admins successfully."
 *       400:
 *         description: "Failed to add admins due to invalid input, unauthorized access, or membership issues."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Member with Id: <memberId> is no longer a member of this chat."
 *                 error:
 *                   type: string
 *                   description: "Detailed error message (if applicable)."
 */

/**
 * @swagger
 * ADD_MEMBERS_CLIENT:
 *   patch:
 *     summary: Add members to a chat group
 *     description: Adds multiple users to a chat group, ensuring they are not already members and the chat exists.
 *     tags:
 *       - Sockets
 *     parameters:
 *       - in: body
 *         name: data
 *         description: Data required to add users to the chat group.
 *         schema:
 *           type: object
 *           properties:
 *             chatId:
 *               type: string
 *               description: The ID of the chat to which users are being added.
 *               example: '60f6c72ef56d9e0020f290f2'
 *             users:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of user IDs to be added to the chat.
 *               example: ['60f6c72ef56d9e0020f290f3', '60f6c72ef56d9e0020f290f4']
 *     responses:
 *       200:
 *         description: Members added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Members added successfully
 *       400:
 *         description: Error in adding members to the chat.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Some users could not be added
 *                 error:
 *                   type: string
 *                   example: Could not add users with IDs 60f6c72ef56d9e0020f290f3, 60f6c72ef56d9e0020f290f4
 */

/**
 * @swagger
 * REMOVE_MEMBERS_CLIENT:
 *   delete:
 *     summary: Remove members from a group or channel chat
 *     description: Removes specified members from a group or channel chat. Only admins or creators can perform this action.
 *     tags:
 *       - Sockets
 *     operationId: "removeMembers"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: "The ID of the group chat."
 *                 example: "64f123abc456def789012345"
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "An array of user IDs to be removed from the group."
 *                 example: ["64f123abc456def789012346", "64f123abc456def789012347"]
 *     responses:
 *       200:
 *         description: "Successfully removed members."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Members removed successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: "Failed to remove members due to invalid input or permissions."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Some users could not be removed"
 *                 error:
 *                   type: string
 *                   example: "Could not remove users with IDs: 64f123abc456def789012346"
 */

/**
 * @swagger
 * SET_PERMISSION_CLIENT:
 *   patch:
 *     summary: Update permissions for a group or channel chat
 *     description: Allows an admin to update messaging or downloading permissions in a group chat or channel. Only users with admin privileges can perform this action.
 *     tags:
 *       - Sockets
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - type
 *               - who
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The unique identifier of the group chat.
 *               type:
 *                 type: string
 *                 enum: [post, download]
 *                 description: The type of permission to update (`post` for messaging, `download` for downloading files).
 *               who:
 *                 type: string
 *                 enum: [everyone, admin-only]
 *                 description: Defines who can perform the specified action (`everyone` or `admin-only`).
 *     responses:
 *       200:
 *         description: Permissions updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Permissions updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     chatId:
 *                       type: string
 *                       description: The ID of the chat where permissions were updated.
 *                     type:
 *                       type: string
 *                       description: The permission type that was updated.
 *                     who:
 *                       type: string
 *                       description: The updated permission scope.
 *       400:
 *         description: Invalid input or insufficient permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Could not update permissions
 *                 error:
 *                   type: string
 *                   example: Invalid permission type or you do not have admin rights
 *       404:
 *         description: Chat not found or deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Could not update permissions
 *                 error:
 *                   type: string
 *                   example: This chat does not exist or has been deleted
 */

/**
 * @swagger
 * CREATE-CALL:
 *   post:
 *     summary: Initiates a new voice call.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The unique ID of the chat where the voice call is started.
 *               targetId:
 *                 type: string
 *                 description: Used to when there is no chat between the two users.
 *                 example: "98765"
 */

/**
 * @swagger
 * JOIN-CALL:
 *   post:
 *     summary: Joins an existing voice call.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               voiceCallId:
 *                 type: string
 *                 description: The ID of the voice call to join.
 */

/**
 * @swagger
 * SIGNAL-SERVER:
 *   post:
 *     summary: Sends signaling data to a specific client.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ICE, OFFER, ANSWER]
 *                 description: The type of signaling message.
 *               targetId:
 *                 type: string
 *                 description: The ID of the target client.
 *               voiceCallId:
 *                 type: string
 *                 description: The ID of the voice call.
 *               data:
 *                 type: object
 *                 description: The actual signaling data.
 */

/**
 * @swagger
 * LEAVE:
 *   post:
 *     summary: Leaves a voice call.
 *     tags: [Sockets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               voiceCallId:
 *                 type: string
 *                 description: The ID of the voice call to leave.
 */
