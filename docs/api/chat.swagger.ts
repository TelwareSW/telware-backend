/**
 * @swagger
 * tags:
 *  name: Chat
 *  description: The Chat Managing API
 */

/**
 * @swagger
 * /chats:
 *   get:
 *     summary: Retrieve all chats for the authenticated user.
 *     description: Fetches all chats associated with the authenticated user, including chat members, last messages, and chat details.
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter chats by type (e.g., "group", "private").
 *     responses:
 *       200:
 *         description: Successfully retrieved all chats.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Chats retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     chats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           chat:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: Unique identifier for the chat.
 *                               isSeen:
 *                                 type: boolean
 *                                 description: Indicates if the chat has been seen.
 *                               members:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     user:
 *                                       type: string
 *                                       description: Unique identifier for the user.
 *                                     Role:
 *                                       type: string
 *                                       description: Role of the user in the chat (e.g., member, admin).
 *                                     _id:
 *                                       type: string
 *                                       description: Unique identifier for the membership entry.
 *                                     id:
 *                                       type: string
 *                                       description: Alias for `_id`.
 *                               type:
 *                                 type: string
 *                                 description: Type of the chat (e.g., "private", "group").
 *                               isDeleted:
 *                                 type: boolean
 *                                 description: Indicates if the chat has been deleted.
 *                               chatType:
 *                                 type: string
 *                                 description: Specific type of the chat (e.g., "NormalChat").
 *                               __v:
 *                                 type: integer
 *                                 description: Version key.
 *                               numberOfMembers:
 *                                 type: integer
 *                                 description: Total number of members in the chat.
 *                               id:
 *                                 type: string
 *                                 description: Alias for `_id`.
 *                           isMuted:
 *                             type: boolean
 *                             description: Indicates if the chat is muted.
 *                           draft:
 *                             type: string
 *                             description: Draft message saved for the chat.
 *                           _id:
 *                             type: string
 *                             description: Unique identifier for the chat entry.
 *                           id:
 *                             type: string
 *                             description: Alias for `_id`.
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Unique identifier for the member.
 *                           username:
 *                             type: string
 *                             description: Username of the member.
 *                           screenFirstName:
 *                             type: string
 *                             description: First name displayed on the screen.
 *                           screenLastName:
 *                             type: string
 *                             description: Last name displayed on the screen.
 *                           phoneNumber:
 *                             type: string
 *                             description: The phone number of the member.
 *                           photo:
 *                             type: string
 *                             description: URL to the member's photo.
 *                           status:
 *                             type: string
 *                             description: Current status of the member (e.g., "offline").
 *                           isAdmin:
 *                             type: boolean
 *                             description: Whether the member is an admin.
 *                           stories:
 *                             type: array
 *                             items:
 *                               type: string
 *                               description: IDs of the member's stories.
 *                           blockedUsers:
 *                             type: array
 *                             items:
 *                               type: string
 *                               description: IDs of users blocked by this member.
 *                           id:
 *                             type: string
 *                             description: Alias for `_id`.
 *                     lastMessages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           chatId:
 *                             type: string
 *                             description: Unique identifier of the chat this message belongs to.
 *                           lastMessage:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: Unique identifier for the message.
 *                               senderId:
 *                                 type: string
 *                                 description: Unique identifier of the sender.
 *                               chatId:
 *                                 type: string
 *                                 description: Unique identifier of the chat the message belongs to.
 *                               communicationType:
 *                                 type: string
 *                                 description: Type of communication (e.g., "Message").
 *                               content:
 *                                 type: string
 *                                 description: The content of the message.
 *                               contentType:
 *                                 type: string
 *                                 description: Type of the message content (e.g., "text").
 *                               isPinned:
 *                                 type: boolean
 *                                 description: Indicates if the message is pinned.
 *                               isForward:
 *                                 type: boolean
 *                                 description: Indicates if the message is forwarded.
 *                               isAnnouncement:
 *                                 type: boolean
 *                                 description: Indicates if the message is an announcement.
 *                               threadMessages:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                                   description: IDs of thread messages linked to this message.
 *                               timestamp:
 *                                 type: string
 *                                 format: date-time
 *                                 description: Timestamp when the message was sent.
 *                               __v:
 *                                 type: integer
 *                                 description: Version key.
 *                               id:
 *                                 type: string
 *                                 description: Alias for `_id`.
 *       401:
 *         description: User is not logged in or the request is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: You need to login first
 *       500:
 *         description: Server error occurred.
 */

/**
 * @swagger
 * /chats:
 *   post:
 *     summary: Create a new chat.
 *     description: Allows an authenticated user to create a new chat with specified members. The creator is automatically assigned as the "creator" role, and other members are assigned the "member" role.
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of the chat (e.g., "group", "private").
 *                 example: group
 *               name:
 *                 type: string
 *                 description: Name of the chat.
 *                 example: Project Team
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: User IDs of the members to add to the chat.
 *                 example: ["63e1f5c2d1234e0012345678", "63e1f5c2d1234e0012345679"]
 *     responses:
 *       201:
 *         description: Chat created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Chat created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The unique ID of the created chat.
 *                       example: "63e1f5c2d1234e0012345678"
 *                     name:
 *                       type: string
 *                       description: Name of the chat.
 *                       example: Project Team
 *                     type:
 *                       type: string
 *                       description: Type of the chat.
 *                       example: group
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user:
 *                             type: string
 *                             description: Member ID.
 *                             example: "63e1f5c2d1234e0012345678"
 *                           Role:
 *                             type: string
 *                             description: Role of the member in the chat.
 *                             example: member
 *       401:
 *         description: User not logged in or invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: You need to login first
 *       500:
 *         description: Server error occurred.
 */

/**
 * @swagger
 * /chats/messages/{chatId}:
 *   get:
 *     summary: Retrieve messages from a specific chat
 *     tags: [Chat]
 *     description: Get messages from a specific chat. Only members of the chat can access this endpoint.
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number for paginated messages (default is 1).
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 50
 *         description: The number of messages to retrieve per page (default is 100).
 *     responses:
 *       200:
 *         description: Messages retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: messages retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "674cbbba97faf0d2e8a93846"
 *                           content:
 *                             type: string
 *                             example: this should disappear
 *                           contentType:
 *                             type: string
 *                             example: text
 *                           isPinned:
 *                             type: boolean
 *                             example: false
 *                           isForward:
 *                             type: boolean
 *                             example: false
 *                           senderId:
 *                             type: string
 *                             example: "674b62b8595166a31cef6bad"
 *                           chatId:
 *                             type: string
 *                             example: "674b62b9595166a31cef6c13"
 *                           parentMessage:
 *                             type: string
 *                             example: "674b62b9595166a31cef6c12"
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-12-01T19:37:56.399Z"
 *                           isAnnouncement:
 *                             type: boolean
 *                             example: false
 *                           threadMessages:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: []
 *                           messageType:
 *                             type: string
 *                             example: private
 *                           __v:
 *                             type: integer
 *                             example: 0
 *                           id:
 *                             type: string
 *                             example: "674cbbba97faf0d2e8a93846"
 *                     nextPage:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Bad Request - Chat does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "This chat does not exist."
 *       403:
 *         description: Forbidden - User is not a member of the chat or the chat has no members.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "You are not a member of this chat, you are not allowed here."
 *       401:
 *         description: Unauthorized - User not logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "You need to log in to access this resource."
 */

/**
 * @swagger
 * /chats/destruct/{chatId}:
 *   patch:
 *     summary: Enable self-destruction for a chat
 *     description: Set a self-destruction timer for a chat by providing a destruction duration. Only members of the chat are allowed to enable self-destruction.
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat to enable self-destruction for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destructionDuration:
 *                 type: number
 *                 description: The duration (in milliseconds) after which the chat will self-destruct.
 *                 example: 86400000
 *     responses:
 *       200:
 *         description: Destruction time enabled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Destruction time is enabled successfully"
 *       400:
 *         description: Missing required fields or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "missing required fields"
 *       404:
 *         description: Chat not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "No chat with the provided id"
 */

/**
 * @swagger
 * /chats/un-destruct/{chatId}:
 *   patch:
 *     summary: Disable self-destruction for a chat
 *     tags: [Chat]
 *     description: Disable the self-destruction timer for a chat. Only members of the chat are allowed to disable self-destruction.
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat to disable self-destruction for.
 *     responses:
 *       200:
 *         description: Destruction time disabled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Destruction time is disabled successfully"
 *       404:
 *         description: Chat not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "No chat with the provided id"
 */

/**
 * @swagger
 * /chats/media:
 *   post:
 *     summary: Upload a media file for chats
 *     description: Uploads a media file to the server and returns the filename of the uploaded file.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The media file to upload
 *     responses:
 *       200:
 *         description: Media file uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Uploaded media file successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     mediaFileName:
 *                       type: string
 *                       description: The name of the uploaded media file
 *                       example: media-file-name.jpg
 *       400:
 *         description: Bad Request. File not provided or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: An error occurred while uploading the story
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: An error occurred while uploading the story
 */

/**
 * @swagger
 * /chats/get-all-drafts:
 *   get:
 *     summary: Get all drafts
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of drafts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 */

/**
 * @swagger
 * /chats/{chatId}:
 *   get:
 *     summary: Retrieve a specific chat
 *     tags: [Chat]
 *     description: Retrieve the details of a specific chat by its ID, including its members.
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat to retrieve.
 *     responses:
 *       200:
 *         description: Chat retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Chat retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     chat:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: The ID of the chat.
 *                           example: "648ac9dc36f5a1c5e84e6f7b"
 *                         isSeen:
 *                           type: boolean
 *                           description: Whether the chat is marked as seen.
 *                           example: true
 *                         members:
 *                           type: array
 *                           description: List of chat members with their roles.
 *                           items:
 *                             type: object
 *                             properties:
 *                               user:
 *                                 type: string
 *                                 description: The user ID of the member.
 *                                 example: "63e1f5c2d1234e0012345678"
 *                               Role:
 *                                 type: string
 *                                 description: Role of the member in the chat.
 *                                 enum:
 *                                   - "member"
 *                                   - "admin"
 *                                   - "creator"
 *                                 default: "member"
 *                               _id:
 *                                 type: string
 *                                 description: The ID of the member record.
 *                                 example: "63e1f5c2d1234e0012345679"
 *                               id:
 *                                 type: string
 *                                 description: Alias for `_id`.
 *                                 example: "63e1f5c2d1234e0012345679"
 *                         type:
 *                           type: string
 *                           description: The type of the chat (e.g., private, group, channel).
 *                           example: "private"
 *                         numberOfMembers:
 *                           type: integer
 *                           description: Number of members in the chat.
 *                           example: 2
 *       404:
 *         description: Chat not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "No chat with the provided id"
 */

/**
 * @swagger
 * /chats/get-draft:
 *   get:
 *     summary: Get a specific draft
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A draft's details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 */

/**
 * @swagger
 * /chats/{chatId}:
 *   delete:
 *     summary: Delete a group chat by ID.
 *     description: Deletes a group chat and removes all members. Marks the chat as deleted. This action is only allowed for the creator of the chat.
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat to be deleted.
 *     responses:
 *       204:
 *         description: Successfully deleted the chat.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: chat deleted successfully
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: No chat found with the provided ID or chat is already deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: no chat found with the provided id
 *       403:
 *         description: You are not authorized to delete this chat. You must be the creator of the chat.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: you do not have permission
 *       500:
 *         description: Server error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
