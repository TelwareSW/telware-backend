import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import User from '@models/userModel';
import Chat from '@models/chatModel';
import GroupChannel from '@models/groupChannelModel';
import NormalChat from '@base/models/normalChatModel';
import { muteUnmuteChat } from '@base/services/chatService';
import IUser from '@base/types/user';
import {
  check,
  informSessions,
  joinRoom,
  updateDraft,
} from './MessagingServices';

const handleAddAdmins = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { members, chatId } = data;
  const InvalidUsers: string[] = [];

  const chat = await Chat.findById(chatId);
  const func = await check(chat, ack, senderId, {
    chatType: ['group', 'channel'],
    checkAdmin: true,
  });
  if (!func) return func;

  await Promise.all(
    members.map(async (memId: string) => {
      const user = await User.findById(memId);

      if (!user) {
        InvalidUsers.push(memId);
        return;
      }

      const isMemberOfChat = chat?.members.some((m) => m.user.equals(memId));

      if (!isMemberOfChat) {
        InvalidUsers.push(memId);
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
      socket.to(chatId).emit('ADD_ADMINS_SERVER', { chatId, memId });
    })
  );

  if (InvalidUsers.length > 0) {
    return ack({
      success: false,
      message: 'Some users could not be added as admins',
      error: `Could not add users with IDs: ${InvalidUsers.join(', ')}`,
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
  socket: Socket,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { chatId, users } = data;
  const invalidUsers: string[] = [];

  const chat = await Chat.findById(chatId);
  const func = await check(chat, ack, senderId, {
    chatType: ['group', 'channel'],
    checkAdmin: true,
  });
  if (!func) return func;

  if (
    chat?.type === 'group' &&
    chat.members.length + users.length >
      parseInt(process.env.GROUP_SIZE ?? '10', 10)
  )
    return ack({
      success: false,
      message: 'Faild to create the chat',
      error: `groups cannot have more than ${process.env.GROUP_SIZE ?? '10'} members`,
    });

  await Promise.all(
    users.map(async (userId: any) => {
      const user = await User.findById(userId);

      if (!user) {
        invalidUsers.push(userId);
        return;
      }

      const isAlreadyMember = chat?.members.some((m: any) =>
        m.user.equals(userId)
      );
      if (isAlreadyMember) {
        invalidUsers.push(userId);
        return;
      }

      chat?.members.push({ user: userId, Role: 'member' });
      const userWasMember = user.chats.some((c: any) => c.chat.equals(chatId));
      if (!userWasMember)
        User.findByIdAndUpdate(
          userId,
          { $push: { chats: { chat: chatId } } },
          { new: true }
        );

      await joinRoom(io, chatId as string, userId);
      socket.to(chatId).emit('ADD_MEMBERS_SERVER', { chatId, userId });
    })
  );

  await chat?.save({ validateBeforeSave: false });

  ack({
    success: true,
    message:
      invalidUsers.length > 0
        ? `Some users could not be added, IDs: ${invalidUsers.join(', ')}`
        : 'Members added successfully',
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
    informSessions(io, memberId, newChat, 'JOIN_PRIVATE_CHAT'),
    informSessions(io, senderId, newChat, 'JOIN_PRIVATE_CHAT'),
    User.updateMany(
      { _id: { $in: [memberId, senderId] } },
      { $push: { chats: { chat: newChat._id } } },
      { new: true }
    ),
  ]);

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

  if (
    type === 'group' &&
    members.length > parseInt(process.env.GROUP_SIZE ?? '10', 10)
  )
    return ack({
      success: false,
      message: 'Faild to create the chat',
      error: `groups cannot have more than ${process.env.GROUP_SIZE ?? '10'} members`,
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
    allMembers.map(async (member) => {
      joinRoom(io, newChat._id as string, member.user);
      informSessions(io, member.user, newChat, 'JOIN_GROUP_CHANNEL');
    }),
    User.updateMany(
      { _id: { $in: allMembers.map((member) => member.user) } },
      { $push: { chats: { chat: newChat._id } } },
      { new: true }
    ),
  ]);

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
    await informSessions(
      io,
      member.user,
      { chatId },
      'DELETE_GROUP_CHANNEL_SERVER'
    );
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
  const chat = await GroupChannel.findById(chatId);
  const func = await check(chat, ack, senderId, {
    chatType: ['group', 'channel'],
  });
  if (!func) return func;

  await Promise.all([
    GroupChannel.findByIdAndUpdate(chatId, {
      $pull: { members: { user: senderId } },
    }),
    User.findByIdAndUpdate(senderId, {
      $pull: { chats: { chat: chatId } },
    }),
  ]);

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
  const invalidUsers: string[] = [];

  const chat = await GroupChannel.findById(chatId);

  const func = await check(chat, ack, senderId, {
    chatType: ['group', 'channel'],
    checkAdmin: true,
  });
  if (!func) return func;

  await Promise.all(
    members.map(async (memberId: any) => {
      const user = await User.findById(memberId);
      if (!user) {
        invalidUsers.push(memberId);
        return;
      }

      const isMember = chat.members.some((m: any) => m.user.equals(memberId));
      if (!isMember) {
        invalidUsers.push(memberId);
        return;
      }

      await Promise.all([
        GroupChannel.findByIdAndUpdate(chatId, {
          $pull: { members: { user: memberId } },
        }),
        User.findByIdAndUpdate(memberId, {
          $pull: { chats: { chat: chatId } },
        }),
      ]);
    })
  );

  socket
    .to(chatId)
    .emit('REMOVE_MEMBERS_SERVER', { chatId, memberId: senderId });

  ack({
    success: true,
    message:
      invalidUsers.length > 0
        ? `Some users could not be removed, IDs: ${invalidUsers.join(', ')}`
        : 'Members removed successfully',
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
  const func = await check(chat, ack, senderId, {
    chatType: ['group', 'channel'],
    checkAdmin: true,
  });
  if (!func) return func;

  if (type === 'post') chat.messagingPermission = who === 'everyone';
  else if (type === 'download') chat.downloadingPermission = who === 'everyone';
  await chat.save();
  socket.to(chatId).emit('SET_PERMISSION_SERVER', { chatId, type, who });
  ack({
    success: true,
    message: 'permissions updated successfully',
    data: {},
  });
};

const handleSetPrivacy = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { chatId, privacy } = data;

  const chat = await GroupChannel.findById(chatId);
  const func = await check(chat, ack, senderId, {
    chatType: ['group', 'channel'],
    checkAdmin: true,
  });
  if (!func) return func;

  chat.privacy = privacy;
  await chat.save();
  socket.to(chatId).emit('SET_PRIVACY_SERVER', { chatId, privacy });
  ack({
    success: true,
    message: 'privacy updated successfully',
    data: {},
  });
};

const handleMuteChat = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { muteDuration, chatId } = data;
  const userId = ((await User.findById(senderId)) as IUser)
    ._id as Types.ObjectId;

  await muteUnmuteChat(
    io,
    userId.toString(),
    chatId,
    'MUTE_CHAT',
    muteDuration
  );
  if (muteDuration !== -1) {
    setTimeout(async () => {
      muteUnmuteChat(io, userId.toString(), chatId, 'UNMUTE_CHAT');
    }, muteDuration * 1000);
  }

  ack({ success: true, message: 'Chat muted successfully' });
};

const handleUnMuteChat = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { chatId } = data;
  const userId = ((await User.findById(senderId)) as IUser)
    ._id as Types.ObjectId;
  await muteUnmuteChat(io, userId.toString(), chatId, 'UNMUTE_CHAT');
  ack({ success: true, message: 'Chat unmuted successfully' });
};

const handleEnableDestruction = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { destructionDuration, chatId } = data;
  const destructionTimestamp = Date.now();
  await NormalChat.findByIdAndUpdate(chatId, {
    destructionDuration,
    destructionTimestamp,
  });
  await informSessions(io, senderId, { chatId }, 'ENABLE_DESTRUCTION_SERVER');
  ack({ success: true, message: 'Chat enabled destruction successfully' });
};

const handleDisableDestruction = async (
  io: any,
  socket: Socket,
  data: any,
  ack: Function,
  senderId: any
) => {
  const { chatId } = data;
  await NormalChat.findByIdAndUpdate(chatId, {
    destructionTimestamp: undefined,
    destructionDuration: undefined,
  });
  await informSessions(io, senderId, { chatId }, 'ENABLE_DESTRUCTION_SERVER');
  ack({ success: true, message: 'Chat disabled destruction successfully' });
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

  socket.on('SET_PRIVACY_CLIENT', (data: any, ack: Function) => {
    handleSetPrivacy(io, socket, data, ack, userId);
  });

  socket.on('ADD_ADMINS_CLIENT', (data: any, ack: Function) => {
    handleAddAdmins(io, socket, data, ack, userId);
  });

  socket.on('ADD_MEMBERS_CLIENT', (data: any, ack: Function) => {
    handleAddMembers(io, socket, data, ack, userId);
  });

  socket.on('REMOVE_MEMBERS_CLIENT', (data: any, ack: Function) => {
    handleRemoveMembers(io, socket, data, ack, userId);
  });

  socket.on('MUTE_CHAT_CLIENT', (data: any, ack: Function) => {
    handleMuteChat(io, socket, data, ack, userId);
  });

  socket.on('UNMUTE_CHAT_CLIENT', (data: any, ack: Function) => {
    handleUnMuteChat(io, socket, data, ack, userId);
  });

  socket.on('ENABLE_DESTRUCTION_CLIENT', (data: any, ack: Function) => {
    handleEnableDestruction(io, socket, data, ack, userId);
  });

  socket.on('DISABLE_DESTRUCTION_CLIENT', (data: any, ack: Function) => {
    handleDisableDestruction(io, socket, data, ack, userId);
  });

  socket.on('UPDATE_DRAFT_CLIENT', (data: any, ack: Function) =>
    handleDraftMessage(io, socket, data, ack, userId)
  );
};

export default registerChatHandlers;
