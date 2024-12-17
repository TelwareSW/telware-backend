import { Response ,NextFunction } from 'express';
import Message from '@base/models/messageModel';
import Chat from '@base/models/chatModel';
import catchAsync from '@utils/catchAsync';
import GroupChannel from '@base/models/groupChannelModel';
import User from '@base/models/userModel';
import IUser from '@base/types/user';
import IChat from '@base/types/chat';
import IGroupChannel from '@base/types/groupChannel';
export const searchMessages = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  try {
    let globalSearchResult: {
      groups: IGroupChannel[];
      chats: IChat[];
      users: IUser[];
    } = {
      groups: [],
      chats: [],
      users: []
    };

    const { query, searchSpace, filter, isGlobalSearch } = req.body;

    // Input validation
    if (!query || !searchSpace || typeof isGlobalSearch === 'undefined') {
      return res.status(400).json({ message: 'Query, searchSpace, and isGlobalSearch are required' });
    }

    const searchConditions: any = { content: { $regex: query, $options: 'i' } };

    // Handle contentType filter
    if (filter) {
      const filterTypes = filter.split(',');
      searchConditions.contentType = { $in: filterTypes };
    }

    // Prepare chat type filters
    const spaces = searchSpace.split(',');
    const chatTypeConditions: any[] = [];

    if (spaces.includes('chats')) {
      chatTypeConditions.push({ type: 'private' });
    }
    if (spaces.includes('channels')) {
      chatTypeConditions.push({ type: 'channel' });
    }
    if (spaces.includes('groups')) {
      chatTypeConditions.push({ type: 'group' });
    }

    // Limit search to user's chats unless global search
    let chatFilter: any = {};
    const userChats = await Chat.find({
      members: { $elemMatch: { user: req.user._id } },
    }).select('_id type');

    // Filter user chats by type
    const filteredChats = userChats.filter((chat) =>
      chatTypeConditions.length > 0 ? chatTypeConditions.some((cond) => cond.type === chat.type) : true
    );

    const chatIds = filteredChats.map((chat) => chat._id);
    chatFilter = { chatId: { $in: chatIds } };

    // Combine filters
    const finalSearchConditions = { ...searchConditions, ...chatFilter };

    // Fetch messages and populate references
    const messages = await Message.find(finalSearchConditions)
      .populate('senderId', 'username')
      .populate({
        path: 'chatId',
        select: 'name type',
      })
      .limit(50);

    // Global Search for Groups, Channels, and Chats
    if (isGlobalSearch) {
      // Groups and Channels by name
      const groupsAndChannels = await GroupChannel.find({
        name: { $regex: query, $options: 'i' },
      }).select('name type picture');

      globalSearchResult.groups = groupsAndChannels.filter((gc: IGroupChannel) => gc.type === 'group');
      globalSearchResult.chats = groupsAndChannels.filter((gc: IGroupChannel) => gc.type === 'channel');

      // Users (to find chats involving usernames)
      const users = await User.find({
        username: { $regex: query, $options: 'i' },
      }).select('username _id');

      globalSearchResult.users = users;

      // Chats where the user is a member and the username matches
      const userIds = users.map((user) => user._id);
      const chats = await Chat.find({
        members: { $elemMatch: { user: { $in: userIds } } },
        type: 'private',
      }).select('type members');

      globalSearchResult.chats.push(...chats);
    }

    res.status(200).json({
      success: true,
      data: {
        searchResult: messages,
        globalSearchResult: globalSearchResult,
      },
    });
  } catch (error) {
    console.error('Error in searchMessages:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export const searchMessagesDummmy = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { query, searchSpace, filter, isGlobalSearch } = req.query;

    if (!query || !searchSpace || typeof isGlobalSearch === 'undefined') {
      return res.status(400).json({ message: 'Query, searchSpace, and isGlobalSearch are required' });
    }
  } catch (error) {
    console.error('Error in searchMessages:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
