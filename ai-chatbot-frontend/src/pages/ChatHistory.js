import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

const ChatHistory = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showMessageMenu, setShowMessageMenu] = useState(null); // Track which message's menu is open
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch chat history on component mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get("https://chatbot-tzms.onrender.com/api/chat/get-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatHistory(res.data.messages);
    } catch (error) {
      console.error("Failed to load chat history", error);
    }
  };

  // Delete a specific message
  const deleteMessage = async (index) => {
    try {
      await axios.delete(`https://chatbot-tzms.onrender.com/api/chat/delete-message/${index}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the message from the chat history
      setChatHistory((prev) => prev.filter((_, i) => i !== index));
      setShowMessageMenu(null); // Close the menu after deletion
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat History</h2>
        <button onClick={() => navigate("/chat")}>Back to Chat</button>
      </div>

      <div className="chat-history">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === "user" ? "user-message" : "assistant-message"}`}
          >
            <strong>{msg.role}:</strong> {msg.content}
            <div className="message-options">
              <button
                className="message-menu-button"
                onClick={() => setShowMessageMenu(showMessageMenu === index ? null : index)}
              >...</button>
              {showMessageMenu === index && (
                <div className="message-menu">
                  <button onClick={() => deleteMessage(index)}>Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;