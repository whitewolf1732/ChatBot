import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import authMiddleware from "../middleware/authMiddleware.js";
import Chat from "../models/Chat.js";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Send Message and Save to Chat History
router.post("/send-message", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    // Generate AI response
    const result = await model.generateContent(message);
    const response = await result.response;
    const aiReply = response.text();

    // Find or create a chat document for the user
    let chat = await Chat.findOne({ userId });

    if (!chat) {
      chat = new Chat({ userId, messages: [] });
    }

    // Add user message and AI reply to the chat history
    chat.messages.push({ role: "user", content: message });
    chat.messages.push({ role: "assistant", content: aiReply });

    // Save the updated chat document
    await chat.save();

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
});

// Get Chat History for the Authenticated User
router.get("/get-history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the chat document for the user
    const chat = await Chat.findOne({ userId });

    if (!chat) {
      return res.status(200).json({ messages: [{ role: "assistant", content: "Start chatting with AI!" }] });
    }

    res.status(200).json({ messages: chat.messages });
  } catch (error) {
    console.error("Error fetching chat history:", error.message);
    res.status(500).json({ message: "Failed to fetch chat history", error: error.message });
  }
});

// Clear Chat History for the Authenticated User
router.delete("/clear-history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete the chat document for the user
    await Chat.deleteOne({ userId });

    res.status(200).json({ message: "Chat history cleared successfully" });
  } catch (error) {
    console.error("Error clearing chat history:", error.message);
    res.status(500).json({ message: "Failed to clear chat history", error: error.message });
  }
});

// Delete a Specific Message by Message Index
router.delete("/delete-message/:index", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const index = parseInt(req.params.index);

    // Find the chat document for the user
    const chat = await Chat.findOne({ userId });

    if (!chat) {
      return res.status(404).json({ message: "Chat history not found" });
    }

    // Check if the index is valid
    if (index < 0 || index >= chat.messages.length) {
      return res.status(400).json({ message: "Invalid message index" });
    }

    // Remove the message at the specified index
    chat.messages.splice(index, 1);

    // Save the updated chat document
    await chat.save();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error.message);
    res.status(500).json({ message: "Failed to delete message", error: error.message });
  }
});

export default router;