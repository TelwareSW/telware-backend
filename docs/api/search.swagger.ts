/**
 * @swagger
 * tags:
 *   name: Search
 *   description: API for searching content across various spaces with optional filters and global search capabilities.
 */
/**
 * @swagger
 * /search-request:
 *   get:
 *     summary: Perform a search across specified spaces with optional filters.
 *     tags: [Search]
 *     description: Allows users to search within specific spaces like chats, channels, and groups, apply filters, and enable global search for a broader scope.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: The search query string.
 *                 example: "project updates"
 *               searchSpace:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum:
 *                     - chats
 *                     - channels
 *                     - groups
 *                 description: Specifies the spaces to search in. If empty, searches all spaces.
 *                 example: ["chats", "groups"]
 *               filter:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum:
 *                       - images/videos
 *                       - links
 *                       - files
 *                       - voice
 *                       - music
 *                       - text
 *                     description: Optional filter for the type of content to search.
 *                     example: "text"
 *               isGlobalSearch:
 *                 type: boolean
 *                 description: If true, performs a global search across all available spaces, including channels, groups, and users.
 *                 example: true
 *             required:
 *               - query
 *               - searchSpace
 *     responses:
 *       200:
 *         description: Successfully returns search results.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Status message of the response.
 *                   example: "Search completed successfully."
 *                 status:
 *                   type: string
 *                   description: Status of the request.
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     SearchResults:
 *                       type: array
 *                       description: List of search results for specified spaces.
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             description: Type of the result (e.g., chat, group, channel).
 *                             example: "chat"
 *                           chat:
 *                             type: object
 *                             description: Details of the chat if applicable.
 *                             properties:
 *                               members:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                                   description: Members of the chat.
 *                           searchMessage:
 *                             type: object
 *                             description: Details of the message related to the search.
 *                             properties:
 *                               messagePreview:
 *                                 type: string
 *                                 description: Preview of the message matching the search query.
 *                               searchTermIndex:
 *                                 type: integer
 *                                 description: Position of the search term in the message.
 *                     GlobalSearchResults:
 *                       type: array
 *                       description: List of global search results if `isGlobalSearch` is true.
 *                       items:
 *                         type: object
 *                         properties:
 *                           channels:
 *                             type: array
 *                             description: List of channels matching the search query.
 *                             items:
 *                               type: object
 *                           groups:
 *                             type: array
 *                             description: List of groups matching the search query.
 *                             items:
 *                               type: object
 *                           users:
 *                             type: array
 *                             description: List of users matching the search query.
 *                             items:
 *                               type: object
 *       400:
 *         description: Bad Request - Invalid input parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status of the response.
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   description: Details of the error encountered.
 *                   example: "Invalid search space specified."
 *       500:
 *         description: Internal Server Error - Unexpected failure during processing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status of the response.
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   description: Error message explaining the issue.
 *                   example: "An unexpected error occurred while processing the request."
 */


/**
 * @swagger
 * tags:
 *   name: Media
 *   description: API for fetching media suggestions.
 */

/**
 * @swagger
 * /media/suggestions:
 *   get:
 *     summary: Fetch media suggestions based on search space.
 *     tags: [Media]
 *     description: Allows users to fetch suggested media from specified spaces such as chats, channels, or groups.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               searchSpace:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum:
 *                         - chats
 *                         - channels
 *                         - groups
 *                       description: Specifies the space type (e.g., chat, channel, or group).
 *                       example: "chats"
 *                     details:
 *                       type: object
 *                       description: Additional details for the space.
 *                       example: 
 *                         id: "12345"
 *                         name: "Team Discussion"
 *                         description: "This is a chat group for team discussions."
 *             required:
 *               - searchSpace
 *     responses:
 *       200:
 *         description: Successfully returns media suggestions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Status message of the response.
 *                   example: "Media suggestions fetched successfully."
 *                 status:
 *                   type: string
 *                   description: Status of the request.
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     mediaSuggestions:
 *                       type: array
 *                       description: List of media suggestions for specified spaces.
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Unique identifier for the media suggestion.
 *                             example: "67890"
 *                           title:
 *                             type: string
 *                             description: Title or description of the suggested media.
 *                             example: "Meeting Notes"
 *                           type:
 *                             type: string
 *                             description: Type of media (e.g., image, video, document).
 *                             example: "image"
 *                           url:
 *                             type: string
 *                             description: URL to access the suggested media.
 *                             example: "https://example.com/media/67890"
 *                           suggestionSpace:
 *                             type: object
 *                             description: The space from which the suggestion is made.
 *                             example: 
 *                               type: "chats"
 *                               details: 
 *                                 chatId: "12345"
 *                                 
 *                                 
 *       400:
 *         description: Bad Request - Invalid input parameters.
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
 *                   example: "Invalid search space specified."
 *       500:
 *         description: Internal Server Error - Unexpected failure during processing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status of the response.
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   description: Error message explaining the issue.
 *                   example: "An unexpected error occurred while processing the request."
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SearchResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: A descriptive message about the search result.
 *           example: "Search completed successfully."
 *         status:
 *           type: string
 *           description: Status of the search request.
 *           example: "success"
 *         data:
 *           type: object
 *           properties:
 *             SearchResults:
 *               type: array
 *               description: List of search results within the specified search space.
 *               items:
 *                 $ref: '#/components/schemas/SearchResults'
 *             GlobalSearchResults:
 *               type: array
 *               description: Results for a global search across channels, groups, and users.
 *               items:
 *                 $ref: '#/components/schemas/GlobalSearchResults'

 *     SearchResults:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum:
 *             - chat
 *             - group
 *             - channel
 *           description: Type of the search result.
 *           example: "chat"
 *         chat:
 *           type: object
 *           properties:
 *             members:
 *               type: array
 *               description: List of members in the chat or group.
 *               items:
 *                 type: string
 *               example: ["user1", "user2"]
 *         searchMessage:
 *           type: object
 *           properties:
 *             messagePreview:
 *               type: string
 *               description: A preview of the message matching the search term.
 *               example: "Here's the project update you requested."
 *             searchTermIndex:
 *               type: integer
 *               description: Index of the search term in the message preview.
 *               example: 14

 *     GlobalSearchResults:
 *       type: object
 *       properties:
 *         channels:
 *           type: array
 *           description: List of channels matching the global search query.
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Unique identifier of the channel.
 *                 example: "channel123"
 *               name:
 *                 type: string
 *                 description: Name of the channel.
 *                 example: "Project Updates"
 *         groups:
 *           type: array
 *           description: List of groups matching the global search query.
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Unique identifier of the group.
 *                 example: "group456"
 *               name:
 *                 type: string
 *                 description: Name of the group.
 *                 example: "Team Discussion"
 *         users:
 *           type: array
 *           description: List of users matching the global search query.
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Unique identifier of the user.
 *                 example: "user789"
 *               username:
 *                 type: string
 *                 description: Username of the user.
 *                 example: "johndoe"
 */
