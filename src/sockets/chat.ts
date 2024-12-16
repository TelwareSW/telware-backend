import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import User from '@models/userModel';
import Chat from '@models/chatModel';
import GroupChannel from '@models/groupChannelModel';
import NormalChat from '@base/models/normalChatModel';
import {
  check,
  inform,
  joinRoom,
  Member,
  updateDraft,
} from './MessagingServices';

const handleAddAdmins = async (
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

const handleAddMembers = async (
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

const handleCreatePrivateChat = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { memberId } = data;
  const user = User.findById(senderId);
  if (!user)
    return ack({
      success: false,
      message: 'Faild to create the chat',
      error: 'you do not exsist!',
    });

  const newChat = new NormalChat({
    members: [
      {
        user: memberId,
        Role: 'member',
      },
      {
        user: senderId,
        Role: 'member',
      },
    ],
  });

  await newChat.save();
  await Promise.all([
    joinRoom(io, newChat._id as string, memberId),
    joinRoom(io, newChat._id as string, senderId),
    User.updateMany(
      { _id: { $in: [memberId, senderId] } },
      { $push: { chats: { chat: newChat._id } } },
      { new: true }
    ),
  ]);
  socket
    .to(newChat._id as string)
    .emit('JOIN_PRIVATE_CHAT', { chatId: newChat._id as string });

  ack({
    success: true,
    message: 'Chat created successfuly',
    data: newChat,
  });
};

const handleCreateGroupChannel = async (
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

  const membersWithRoles = members.map((id: Types.ObjectId) => ({
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
  await Promise.all([
    allMembers.map((member) =>
      joinRoom(io, newChat._id as string, member.user)
    ),
    User.updateMany(
      { _id: { $in: allMembers.map((member) => member.user) } },
      { $push: { chats: { chat: newChat._id } } },
      { new: true }
    ),
  ]);
  socket
    .to(newChat._id as string)
    .emit('JOIN_GROUP_CHANNEL', { chatId: newChat._id as string });

  ack({
    success: true,
    message: 'Chat created successfuly',
    data: newChat,
  });
};

const handleDeleteGroupChannel = async (
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

const handleLeaveGroupChannel = async (
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

const handleRemoveMembers = async (
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

const handleSetPermission = async (
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

const handleDraftMessage = async (
  io: Server,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: string
) => {
  const { chatId, content } = data;
  await updateDraft(io, senderId, chatId, content);
  ack({ success: true, message: 'Draft saved' });
};

const registerChatHandlers = (io: Server, socket: Socket, userId: any) => {
  socket.on('CREATE_PRIVATE_CHAT', (data: any, ack: Function) => {
    handleCreatePrivateChat(io, socket, data, ack, userId);
  });

  socket.on('CREATE_GROUP_CHANNEL', (data: any, ack: Function) => {
    handleCreateGroupChannel(io, socket, data, ack, userId);
  });

  socket.on('DELETE_GROUP_CHANNEL_CLIENT', (data: any, ack: Function) => {
    handleDeleteGroupChannel(io, socket, data, ack, userId);
  });

  socket.on('LEAVE_GROUP_CHANNEL_CLIENT', (data: any, ack: Function) => {
    handleLeaveGroupChannel(io, socket, data, ack, userId);
  });

  socket.on('SET_PERMISSION_CLIENT', (data: any, ack: Function) => {
    handleSetPermission(io, socket, data, ack, userId);
  });

  socket.on('ADD_ADMINS_CLIENT', (data: any, ack: Function) => {
    handleAddAdmins(io, data, ack, userId);
  });

  socket.on('ADD_MEMBERS_CLIENT', (data: any, ack: Function) => {
    handleAddMembers(io, data, ack, userId);
  });

  socket.on('REMOVE_MEMBERS_CLIENT', (data: any, ack: Function) => {
    handleRemoveMembers(io, socket, data, ack, userId);
  });

  socket.on('UPDATE_DRAFT_CLIENT', (data: any, ack: Function) =>
    handleDraftMessage(io, socket, data, ack, userId)
  );
};

export default registerChatHandlers;
