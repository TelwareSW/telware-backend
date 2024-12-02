/**
 * @swagger
 * tags:
 *  name: Story
 *  description: The Story Managing API
 */

/**
 * @swagger
 * /stories/{storyId}/views:
 *   post:
 *     summary: Mark a story as viewed by the authenticated user
 *     tags: [Story]
 *     description: Adds the authenticated user to the list of users who have viewed the specified story.
 *     parameters:
 *       - name: storyId
 *         in: path
 *         required: true
 *         description: The ID of the story to be marked as viewed.
 *         schema:
 *           type: string
 *           example: "64f1d2d2c1234567890abcdef"
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully marked the story as viewed by the user.
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
 *                   example: "User viewed the story successfully"
 *                 data:
 *                   type: object
 *                   properties: {}
 *       400:
 *         description: Invalid story ID or request data.
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
 *                   example: "Invalid story ID"
 *       404:
 *         description: Story not found.
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
 *                   example: "No story exists with this ID"
 *       401:
 *         description: Unauthorized, user not logged in or session expired.
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
 *                   example: "Session not found, you are not allowed here!"
 */
