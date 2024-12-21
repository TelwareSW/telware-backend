import { Socket } from 'socket.io';
import Message from '@base/models/messageModel';
import { enableDestruction, getChatIds } from '@services/chatService';
import IMessage from '@base/types/message';
import NormalChat from '@base/models/normalChatModel';
import mongoose, { ObjectId } from 'mongoose';
import { getSocketsByUserId } from '@base/services/sessionService';
import User from '@base/models/userModel';
import Chat from '@base/models/chatModel';
import GroupChannel from '@base/models/groupChannelModel';

interface Member {
  _id: mongoose.Types.ObjectId;
  Role: 'member' | 'admin';
}

const check = async (chatId: any, ack: Function, senderId: any) => {
  if (!chatId) {
    return ack({ success: false, message: 'provide the chatId' });
  }
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return ack({
      success: false,
      message: 'no chat found with the provided id',
    });
  }

  if (chat.type === 'private')
    return ack({
      success: false,
      message: 'this is a private chat!',
    });
  const chatMembers = chat.members;
  const chatMembersIds = chatMembers.map((m: any) => m._id);
  if (chatMembersIds.length === 0)
    return ack({
      success: false,
      message: 'this chat is deleted and it no longer exists',
    });

  const admin: Member = chatMembers.find((m) =>
    m.user.equals(senderId)
  ) as unknown as Member;

  if (!admin || admin.Role === 'member')
    return ack({
      success: false,
      message: 'you do not have permission',
    });
};

const inform = async (io: any, userId: string, data: any, event: string) => {
  let memberSocket;
  const socketIds = await getSocketsByUserId(userId);
  if (!socketIds || socketIds.length !== 0)
    socketIds.forEach((socketId: any) => {
      memberSocket = io.sockets.sockets.get(socketId);
      if (memberSocket) memberSocket.emit(event, data);
    });
};

const joinRoom = async (io: any, roomId: String, userId: ObjectId) => {
  const socketIds = await getSocketsByUserId(userId);
  socketIds.forEach((socketId: string) => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) socket.join(roomId);
  });
};

export const updateDraft = async (
  io: any,
  senderId: string,
  chatId: string,
  content: string
) => {
  await User.findByIdAndUpdate(
    senderId,
    { $set: { 'chats.$[chat].draft': content } },
    {
      arrayFilters: [{ 'chat.chat': chatId }],
    }
  );
  await inform(io, senderId, { chatId, draft: content }, 'UPDATE_DRAFT_SERVER');
};

export const joinAllRooms = async (
  socket: Socket,
  userId: mongoose.Types.ObjectId
) => {
  const chatIds = await getChatIds(userId);
  chatIds.forEach((chatId: mongoose.Types.ObjectId) => {
    socket.join(chatId.toString());
  });
};

export const handleMessaging = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: string
) => {
  let { chatId, media, content, contentType, parentMessageId } = data;
  const { isFirstTime, chatType, isReply, isForward, isAnnouncement } = data;
  if (
    (!isForward &&
      !content &&
      !media &&
      (!contentType || !chatType || !chatId)) ||
    ((isReply || isForward) && !parentMessageId)
  )
    return ack({
      success: false,
      message: 'Failed to send the message',
      error: 'missing required Fields',
    });

  if (
    (isFirstTime && isReply) ||
    (isForward && (content || media || contentType))
  )
    return ack({
      success: false,
      message: 'Failed to send the message',
      error: 'conflicting fields',
    });
  if (isFirstTime) {
    const members = [{ user: chatId }, { user: senderId }];
    const chat = new NormalChat({ members });
    const id = String(chat._id);
    await chat.save();
    socket.join(id);
    await joinRoom(io, id, chatId);
    await User.findByIdAndUpdate(senderId, {
      $push: {
        chats: { chat: id },
      },
    });
    await User.findByIdAndUpdate(chatId, {
      $push: {
        chats: { chat: id },
      },
    });
    chatId = id;
  }

  if (chatType !== 'private') {
    const chat = await GroupChannel.findById(chatId);
    if (!chat)
      return ack({
        success: false,
        message: 'Failed to send the message',
        error: 'this chat does not exist',
      });
    const sender = chat.members.find((member: any) =>
      member.user.equals(senderId)
    );
    console.log(sender);
    if (!sender)
      return ack({
        success: false,
        message: 'Failed to send the message',
        error: 'you are not a member of this chat',
      });
    if (sender.Role !== 'admin' && !chat.messagnigPermission)
      return ack({
        success: false,
        message: 'Failed to send the message',
        error: 'only admins can post and reply to this chat',
      });
    if (sender.Role !== 'admin' && !isReply && chatType === 'channel')
      return ack({
        success: false,
        message: 'Failed to send the message',
        error: 'only admins can post to this channel',
      });
  }

  let parentMessage;
  if (isForward || isReply) {
    parentMessage = (await Message.findById(parentMessageId)) as IMessage;
    if (!parentMessage)
      return ack({
        success: false,
        message: 'Failed to send the message',
        error: 'No message found with the provided id',
      });

    if (!parentMessage)
      return ack({
        success: false,
        message: 'Failed to reply to the message',
        error: 'No message found with the provided parent message id',
      });

    if (isForward) {
      ({ content, contentType, media } = parentMessage);
      parentMessageId = undefined;
    }
  }

  const message = new Message({
    content,
    contentType,
    isForward,
    senderId,
    chatId,
    parentMessageId,
    messageType: chatType,
    isAnnouncement,
  });
  await message.save();
  if (parentMessage && isReply && chatType === 'channel') {
    parentMessage.threadMessages.push(message._id as mongoose.Types.ObjectId);
    await parentMessage.save();
  }

  await updateDraft(io, senderId, chatId, '');
  socket.to(chatId).emit('RECEIVE_MESSAGE', message);
  const res = {
    messageId: message._id,
  };
  enableDestruction(socket, message, chatId);
  ack({ success: true, message: 'Message sent successfully', res });
};

export const handleEditMessage = async (
  socket: Socket,
  data: any,
  ack: Function
) => {
  const { messageId, content, chatId } = data;
  if (!messageId || !content)
    return ack({
      success: false,
      message: 'Failed to edit the message',
      error: 'missing required Fields',
    });
  const message = await Message.findByIdAndUpdate(
    messageId,
    { content, isEdited: true },
    { new: true }
  );
  if (!message)
    return ack({
      success: false,
      message: 'Failed to edit the message',
      error: 'no message found with the provided id',
    });
  if (message.isForward)
    return ack({
      success: false,
      message: 'Failed to edit the message',
      error: 'cannot edit a forwarded message',
    });
  socket.to(chatId).emit('EDIT_MESSAGE_SERVER', message);
  ack({
    success: true,
    message: 'Message edited successfully',
    res: { message },
  });
};

export const handleDeleteMessage = async (
  socket: Socket,
  data: any,
  ack: Function
) => {
  const { messageId, chatId } = data;
  if (!messageId)
    return ack({
      success: false,
      message: 'Failed to delete the message',
      error: 'missing required Fields',
    });
  const message = await Message.findByIdAndDelete(messageId);
  if (!message)
    return ack({
      success: false,
      message: 'Failed to delete the message',
      error: 'no message found with the provided id',
    });
  socket.to(chatId).emit(messageId);
  ack({ success: true, message: 'Message deleted successfully' });
};

export const handleAddAdmins = async (
  io: any,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { members, chatId } = data;
  const forbiddenUsers: string[] = [];
  const func = await check(chatId, ack, senderId);
  const chat = await Chat.findById(chatId);

  if (func) return func;

  if (!chat || chat.isDeleted)
    return ack({
      success: false,
      message: 'Could not add admins to the group',
      error: 'Chat not found',
    });

  await Promise.all(
    members.map(async (memId: string) => {
      const user = await User.findById(memId);

      if (!user) {
        forbiddenUsers.push(memId);
        return;
      }

      const isMemberOfChat = chat.members.some((m) => m.user.equals(memId));

      if (!isMemberOfChat) {
        forbiddenUsers.push(memId);
        return;
      }

      await Chat.findByIdAndUpdate(
        chatId,
        { $set: { 'members.$[elem].Role': 'admin' } },
        {
          new: true,
          arrayFilters: [{ 'elem.user': memId }],
        }
      );

      await inform(io, memId, { chatId }, 'ADD_ADMINS_SERVER');
    })
  );

  if (forbiddenUsers.length > 0) {
    return ack({
      success: false,
      message: 'Some users could not be added as admins',
      error: `Could not add users with IDs: ${forbiddenUsers.join(', ')}`,
    });
  }

  ack({
    success: true,
    message: 'Added admins successfully',
    data: {},
  });
};

export const handleAddMembers = async (
  io: any,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { chatId, users } = data;
  const forbiddenUsers: string[] = [];

  const func = await check(chatId, ack, senderId);
  if (func) return func;

  const chat = await Chat.findById(chatId);
  if (!chat || chat.isDeleted)
    return ack({
      success: false,
      message: 'No chat found with the provided ID',
    });

  await Promise.all(
    users.map(async (userId: any) => {
      const user = await User.findById(userId);

      if (!user) {
        forbiddenUsers.push(userId);
        return;
      }

      const isAlreadyMember = chat.members.some((m: any) =>
        m.user.equals(userId)
      );
      if (!isAlreadyMember) chat.members.push({ user: userId, Role: 'member' });
      const userWasMember = user.chats.some((c: any) => c.chat.equals(chatId));
      if (!userWasMember) user.chats.push(chatId);
      console.log(user.chats);
      if (isAlreadyMember) {
        forbiddenUsers.push(userId);
        return;
      }

      await inform(io, userId, { chatId }, 'ADD_MEMBERS_SERVER');
    })
  );

  if (forbiddenUsers.length > 0) {
    return ack({
      success: false,
      message: 'Some users could not be added',
      error: `Could not add users with IDs: ${forbiddenUsers.join(', ')}`,
    });
  }

  await chat.save();

  ack({
    success: true,
    message: 'Members added successfully',
    data: {},
  });
};

export const handleCreateGroupChannel = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { type, name, members } = data;
  const user = User.findById(senderId);
  if (!user)
    return ack({
      success: false,
      message: 'Faild to create the chat',
      error: 'you need to login first',
    });

  if (!process.env.GROUP_SIZE)
    return ack({
      success: false,
      message: 'Faild to create the chat',
      error: 'define GROUP_SIZE in your .env file',
    });

  if (type === 'group' && members.length > process.env.GROUP_SIZE)
    return ack({
      success: false,
      message: 'Faild to create the chat',
      error: `groups cannot have more than ${process.env.GROUP_SIZE} members`,
    });

  const membersWithRoles = members.map((id: ObjectId) => ({
    user: id,
    Role: 'member',
  }));
  const allMembers = [
    ...membersWithRoles,
    {
      user: senderId,
      Role: 'admin',
    },
  ];
  const newChat = new GroupChannel({
    name,
    type,
    members: allMembers,
  });
  await newChat.save();
  await Promise.all(
    allMembers.map(async (member) => {
      await joinRoom(io, newChat._id as string, member.user);
      return User.findByIdAndUpdate(
        member.user,
        { $push: { chats: { chat: newChat._id } } },
        { new: true }
      );
    })
  );
  socket
    .to(newChat._id as string)
    .emit('JOIN_GROUP_CHANNEL', { chatId: newChat._id as string });

  ack({
    success: true,
    message: 'Chat created successfuly',
    data: newChat,
  });
};

export const handleDeleteGroupChannel = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { chatId } = data;
  const chat = await Chat.findById(chatId);

  if (!chat || chat.isDeleted)
    return ack({
      success: false,
      message: 'Could not delete the group',
      error: 'no chat found with the provided id',
    });

  const chatMembers = chat.members;
  const isCreator = chatMembers.some(
    (member) => member.user.toString() === senderId && member.Role === 'admin'
  );

  if (!isCreator)
    return ack({
      success: false,
      message: 'Could not delete the group',
      error: 'you are not authorized to delete the group',
    });

  chatMembers.map(async (member: any) => {
    await inform(io, member.user, { chatId }, 'DELETE_GROUP_CHANNEL_SERVER');
  });

  chat.members = [];
  chat.isDeleted = true;
  await chat.save();

  return ack({
    success: true,
    message: 'chat deleted successfuly',
    data: chatId,
  });
};

export const handleLeaveGroupChannel = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { chatId } = data;
  const chat = await Chat.findById(chatId);
  if (!chat || chat.isDeleted)
    return ack({
      success: false,
      message: 'could not leave the group',
      error: 'this chat does no longer exist',
    });
  const isMember = chat.members.some(
    (member: any) => member.user.toString() === senderId.toString()
  );
  if (!isMember)
    return ack({
      success: false,
      message: 'could not leave the group',
      error: 'you are not a member of this chat',
    });

  await Chat.updateOne(
    { _id: chatId },
    { $pull: { members: { user: senderId } } }
  );

  socket
    .to(chatId)
    .emit('LEAVE_GROUP_CHANNEL_SERVER', { chatId, memberId: senderId });
  ack({
    success: true,
    message: 'left the group successfuly',
    data: {},
  });
};

export const handleRemoveMembers = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { chatId, members } = data;
  const forbiddenUsers: string[] = [];

  const chat = await Chat.findById(chatId);
  if (!chat || chat.isDeleted)
    return ack({
      success: false,
      message: 'could not remove members from the group',
      error: 'this chat does no longer exist',
    });

  const admin: Member = chat.members.find((m) =>
    m.user.equals(senderId)
  ) as unknown as Member;

  if (!admin)
    return ack({
      success: false,
      message: 'could not remove members from the group',
      error: 'you are no longer a member of this group',
    });

  if (admin.Role === 'member')
    return ack({
      success: false,
      message: 'could not remove members from the group',
      error: 'you do not have permission',
    });

  await Promise.all(
    members.map(async (memberId: any) => {
      const user = await User.findById(memberId);
      if (!user) {
        forbiddenUsers.push(memberId);
        return;
      }

      const isMember = chat.members.some((m: any) => m.user.equals(memberId));
      if (!isMember) {
        forbiddenUsers.push(memberId);
        return;
      }

      await Chat.updateOne(
        { _id: chatId },
        { $pull: { members: { user: memberId } } }
      );

      await inform(io, memberId, { chatId }, 'REMOVE_MEMBERS_SERVER');
    })
  );
  if (forbiddenUsers.length > 0)
    return ack({
      success: false,
      message: 'Some users could not be added',
      error: `Could not remove users with IDs: ${forbiddenUsers.join(', ')}`,
    });
  ack({
    success: true,
    message: 'Members removed successfully',
    data: {},
  });
};

export const handleSetPermission = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { chatId, type, who } = data;

  if (!type || !who)
    return ack({
      success: false,
      message: 'could not update permissions',
      error: 'missing required fields',
    });

  const chat = await GroupChannel.findById(chatId);
  if (!chat || chat.isDeleted)
    return ack({
      success: false,
      message: 'could not update permissions',
      error: 'this chat does no longer exist',
    });

  if (chat.type === 'private')
    return ack({
      success: false,
      message: 'could not update permissions',
      error: 'cannot change permissions for private chats',
    });

  const admin: Member = chat.members.find((m: any) =>
    m.user.equals(senderId)
  ) as unknown as Member;

  if (!admin)
    return ack({
      success: false,
      message: 'could not update permissions',
      error: 'you are no longer a member of this group',
    });

  if (admin.Role === 'member')
    return ack({
      success: false,
      message: 'could not change group permissions',
      error: 'you do not have permission',
    });

  if (type === 'post') chat.messagingPermission = who === 'everyone';
  else if (type === 'download') chat.downloadingPermission = who === 'everyone';
  await chat.save();
  socket.to(chatId).emit('SET_PERMISSION_SERVER', { chatId, type, who });
  console.log(chat);
  ack({
    success: true,
    message: 'permissions updated successfully',
    data: {},
  });
};
