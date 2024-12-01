import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import corsOptions from '@base/config/cors';
import registerChatHandlers from '@base/sockets/chat';
import { getChatIds } from '@services/chatService';
import mongoose from 'mongoose';
import {
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
  handleForwardMessage,
  handleReplyMessage,
} from './services';
import registerMessagesHandlers from './messages';

const joinRooms = async (socket: Socket, userId: mongoose.Types.ObjectId) => {
  const chatIds = await getChatIds(userId, 'all');
  chatIds.forEach((chatId: mongoose.Types.ObjectId) => {
    socket.join(chatId.toString());
  });
};

const socketSetup = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.on('connection', async (socket) => {
    const { userId } = socket.handshake.query;
    console.log(`New client connected: ${socket.id}`);
    await joinRooms(socket, new mongoose.Types.ObjectId(userId as string));

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
     *     summary: Sends a message.
     *     description: Handles sending a message in a chat. If it's the first message, a new chat will be created automatically.
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
     *                 description: The content of the message.
     *               contentType:
     *                 type: string
     *                 description: The type of the content (e.g., "text", "image").
     *               senderId:
     *                 type: string
     *                 description: The unique ID of the sender.
     *               chatId:
     *                 type: string
     *                 description: The unique ID of the chat.
     *               isFirstTime:
     *                 type: boolean
     *                 description: Indicates if this is the first message in the chat.
     *               chatType:
     *                 type: string
     *                 description: The type of the chat (e.g., "private", "group", "channel").
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
     *                 message:
     *                   type: string
     *                   description: A message describing the result.
     *                 res:
     *                   type: object
     *                   description: Additional data for a successful operation.
     *                   properties:
     *                     messageId:
     *                       type: string
     *                       description: The unique ID of the message sent.
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
     *                   description: Details about the error.
     */

    socket.on('SEND_MESSAGE', (data: any, func: Function) =>
      handleSendMessage(socket, data, func)
    );

    /**
     * @swagger
     * /EDIT_MESSAGE:
     *   patch:
     *     summary: Edits Message
     *     description: Edits an existing message in the chat. Cannot edit forwarded messages.
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
     *               content:
     *                 type: string
     *                 description: The new content to update the message with.
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
     *                 message:
     *                   type: string
     *                   description: A message describing the result.
     *       400:
     *         description: Invalid input or missing fields.
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
     *                   description: A message explaining the error.
     *                 error:
     *                   type: string
     *                   description: Details about the error.
     *       404:
     *         description: Message not found or cannot be edited (e.g., forwarded message).
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
     *                 error:
     *                   type: string
     *                   description: The specific error (e.g., message not found or message is forwarded).
     */

    socket.on('EDIT_MESSAGE_CLIENT', (data: any, func: Function) =>
      handleEditMessage(socket, data, func)
    );

    /**
     * @swagger
     * /REPLY_MESSAGE:
     *   post:
     *     summary: Replies to a Message
     *     description: Sends a reply to an existing message in the chat. This creates a new message as a reply to the specified parent message.
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
     *                 message:
     *                   type: string
     *                   description: A message describing the result.
     *                 res:
     *                   type: object
     *                   description: The result of the reply operation, containing the message ID.
     *                   properties:
     *                     messageId:
     *                       type: string
     *                       description: The unique ID of the reply message.
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
     *         description: Parent message not found or failed to create the reply.
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
     *                   description: An error message explaining the failure.
     *                 error:
     *                   type: string
     *                   description: Details about the error (e.g., parent message not found).
     */

    socket.on('REPLY_MESSAGE', (data: any, func: Function) =>
      handleReplyMessage(socket, data, func)
    );

    /**
     * @swagger
     * /DELETE_MESSAGE:
     *   delete:
     *     summary: Deletes a Message
     *     description: Deletes a message from the chat based on the provided message ID. If the message is found, it is deleted.
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
     *       404:
     *         description: No message found with the provided ID.
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
     *                 error:
     *                   type: string
     *                   description: Details about the error (e.g., message not found).
     */

    socket.on('DELETE_MESSAGE', (data: any, func: Function) =>
      handleDeleteMessage(socket, data, func)
    );

    /**
     * @swagger
     * /FORWARD_MESSAGE:
     *   post:
     *     summary: Forwards a Message
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
     *                 message:
     *                   type: string
     *                   description: A message describing the result.
     *                 res:
     *                   type: object
     *                   description: The result of the forward operation, containing the forwarded message ID.
     *                   properties:
     *                     messageId:
     *                       type: string
     *                       description: The unique ID of the forwarded message.
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
     *         description: No message found with the provided ID or failed to forward the message.
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
     *                   description: Details about the error (e.g., message not found).
     */

    socket.on('FORWARD_MESSAGE', (data: any, func: Function) =>
      handleForwardMessage(socket, data, func)
    );

    registerChatHandlers(io, socket);
    registerMessagesHandlers(io, socket);
  });
};

export default socketSetup;
