import { messaging } from '@base/config/firebase';
import Chat from '@base/models/chatModel';
import Message from '@base/models/messageModel';
import User from '@base/models/userModel';

const sendNotification = async (fcmToken: string, title: string, body: any) => {
  const message = {
    notification: {
      title,
      body,
    },
    token: fcmToken,
  };

  try {
    const response = await messaging.send(message);
    console.log('Notification sent successfully:', response);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

const sendNotificationToChat = async (senderId: string, chatId: string) => {
  const targetChat = await Chat.findById(chatId).populate('members');

  if (!targetChat) return;

  const memberIds = targetChat.members.filter(
    (memberId) => memberId.toString() !== senderId
  );

  const members = await User.find({ _id: { $in: memberIds } }, 'chats');

  members.forEach((member) => {
    const targetChatInfo = member.chats.find(
      ({ chat, isMuted }) => chat.toString() === chatId.toString() && !isMuted
    );

    if (targetChatInfo) {
      sendNotification(
        member.fcmToken,
        'Message Received',
        `Message received from ${member.username}`
      );
    }
  });
};

const handleNotifications = async (messageId: string) => {
  const message = await Message.findById(messageId);

  const { senderId, chatId } = message;
  sendNotificationToChat(senderId, chatId);
};

export default handleNotifications;
