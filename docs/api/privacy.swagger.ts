/**
 * @swagger
 * /privacy/read-receipts:
 *   patch:
 *     tags:
 *       - Privacy
 *     summary: Toggle read receipts privacy
 *     description: Enables or disables the read receipts privacy setting for the user.
 *     responses:
 *       '200':
 *         description: Read receipts privacy updated successfully.
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /users/blocked:
 *   get:
 *     tags:
 *       - User
 *     summary: Get blocked users
 *     description: Retrieves the list of users blocked by the authenticated user.
 *     responses:
 *       '200':
 *         description: List of blocked users.
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /privacy/last-seen:
 *   patch:
 *     tags:
 *       - Privacy
 *     summary: Update last-seen privacy settings
 *     description: Allows the user to update the privacy settings for their "last seen" status.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               privacy:
 *                 type: string
 *                 enum: [contacts, everyone, nobody]
 *                 description: Privacy level for last-seen status.
 *                 example: contacts
 *     responses:
 *       '200':
 *         description: Last-seen privacy updated successfully.
 *       '400':
 *         description: Invalid privacy option or bad request.
 *       '404':
 *         description: User not found.
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /privacy/picture:
 *   patch:
 *     tags:
 *       - Privacy
 *     summary: Update profile picture privacy settings
 *     description: Allows the user to update the privacy settings for their profile picture.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               privacy:
 *                 type: string
 *                 enum: [contacts, everyone, nobody]
 *                 description: Privacy level for profile picture.
 *                 example: nobody
 *     responses:
 *       '200':
 *         description: Profile picture privacy updated successfully.
 *       '400':
 *         description: Invalid privacy option or bad request.
 *       '404':
 *         description: User not found.
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /privacy/invite-permissions:
 *   patch:
 *     tags:
 *       - Privacy
 *     summary: Update invite permissions privacy settings
 *     description: Allows the user to update who can send them invites.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               privacy:
 *                 type: string
 *                 description: Privacy level for invite permissions.
 *                 example: contacts
 *     responses:
 *       '200':
 *         description: Invite permissions privacy updated successfully.
 *       '400':
 *         description: Invalid privacy option or bad request.
 *       '404':
 *         description: User not found.
 *     security:
 *       - bearerAuth: []
 */
