import invite from '@base/types/invite';
import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema<invite>({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  expiresIn: {
    type: Date,
    required: true,
  },
});

const Invite = mongoose.model('Invite', inviteSchema);
export default Invite;
