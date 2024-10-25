import mongoose from 'mongoose';



const { Schema } = mongoose;

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    required: true,
    enum: ['like', 'comment', 'reply', 'share' ,'mention'] // Add all possible notification types here
  },
  article: { type: Schema.Types.ObjectId, ref: 'Article', },
  job:{ type: Schema.Types.ObjectId, ref: 'Job', },
  learn:{type: Schema.Types.ObjectId, ref: 'Learn',},
  issue:{ type: Schema.Types.ObjectId, ref: 'Issue', },
  comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
  reply: { type: Schema.Types.ObjectId, ref: 'Reply' },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
