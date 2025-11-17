import mongoose from 'mongoose';

const chatMessageSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'assistant', 'system'],
    },
    content: {
      type: String,
      required: false,
      default: '',
    },
    functionCall: {
      name: String,
      arguments: String,
    },
    toolCalls: [{
      id: String,
      type: String,
      function: {
        name: String,
        arguments: String,
      }
    }],
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
