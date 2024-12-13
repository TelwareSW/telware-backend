import { Response ,NextFunction } from 'express';
import Message from '@base/models/messageModel';
import Chat from '@base/models/chatModel';
import catchAsync from '@utils/catchAsync';


export const searchMessages = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  try {
    const { query, searchSpace, filter, isGlobalSearch } = req.body;

    if (!query || !searchSpace || typeof isGlobalSearch === 'undefined') {
      return res.status(400).json({ message: 'Query, searchSpace, and isGlobalSearch are required' });
    }

    const searchConditions: any = {
      content: { $regex: query as string, $options: 'i' },
    };

    if (filter) {
      const filterTypes = (filter as string).split(',');
      searchConditions.contentType = { $in: filterTypes };
    }

    const spaces = (searchSpace as string).split(',');
    const messageTypes: string[] = [];

    if (spaces.includes('chats')) searchConditions.chatId = { $exists: true };
    if (spaces.includes('channels')) messageTypes.push('channel');
    if (spaces.includes('groups')) messageTypes.push('group');

    if (messageTypes.length > 0) {
      searchConditions.messageType = { $in: messageTypes };
    }

    const userChats = await Chat.find({
      members: { $elemMatch: { _id: req.user._id } },
    }).select('_id');

    console.log(userChats);
    const chatIds = userChats.map((chat) => chat._id);
    searchConditions.chatId = { $in: chatIds };

    console.log(searchConditions);

    const messages = await Message.find(searchConditions)
      .populate('senderId', 'username')
      .populate('chatId', 'name')
      .limit(50)
      .exec();

    res.status(200).json({
      success: true,
      data: messages,
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
