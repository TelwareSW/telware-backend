/**
 * @swagger
 * tags:
 *   name: Search
 *   description: API for searching content in various spaces.
 */
/**
 * @swagger
 * /search-request:
 *   post:
 *     summary: Perform a search across specified spaces with optional filters.
 *     tags: [Search]
 *     description: Allows users to search within specific spaces like chats, channels, and groups with optional filters and an option for global search.
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
 *                 description: Specifies the spaces to search in.
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
 *                 description: If true, performs a global search across channels, groups, and users.
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
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique identifier for the result item.
 *                         example: "12345"
 *                       title:
 *                         type: string
 *                         description: Title of the search result.
 *                         example: "Project Updates - Group"
 *                       type:
 *                         type: string
 *                         description: Type of the result (e.g., chat, channel, group).
 *                         example: "group"
 *                       content:
 *                         type: string
 *                         description: Content snippet related to the search query.
 *                         example: "Discussion about the upcoming project updates."
 *       400:
 *         description: Bad Request - Invalid input parameters.
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
 *                   example: "Invalid search space specified."
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
 *   post:
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
 *                   type: string
 *                   enum:
 *                     - chats
 *                     - channels
 *                     - groups
 *                 description: Specifies the spaces to fetch media suggestions from.
 *                 example: ["channels", "groups"]
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
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique identifier for the media suggestion.
 *                         example: "67890"
 *                       title:
 *                         type: string
 *                         description: Title or description of the suggested media.
 *                         example: "Meeting Notes - Group"
 *                       type:
 *                         type: string
 *                         description: Type of media (e.g., image, video, document).
 *                         example: "image"
 *                       url:
 *                         type: string
 *                         description: URL to access the suggested media.
 *                         example: "https://example.com/media/67890"
 *       400:
 *         description: Bad Request - Invalid input parameters.
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
 *                   example: "Invalid search space specified."
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
