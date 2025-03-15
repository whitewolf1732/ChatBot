import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }, // Reference to the user
  messages: [
    {
      role: { type: String, required: true }, // "user" or "assistant"
      content: { type: String, required: true }, // The message content
    },
  ],
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;