import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const res = await axios.post(
        "https://chatbot-tzms.onrender.com/api/chat/send-message",
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: res.data.reply },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const clearChatHistory = async () => {
    try {
      await axios.delete("https://chatbot-tzms.onrender.com/api/chat/clear-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatHistory([{ role: "assistant", content: "Start chatting with AI!" }]);
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to clear chat history", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
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
        <h2>Chat with AI</h2>
        <div className="profile-icon" onClick={() => setShowMenu(!showMenu)}>
          👤
          {showMenu && (
            <div className="menu">
              <button onClick={() => navigate("/profile")}>Profile</button>
              <button onClick={clearChatHistory}>Clear History</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Display Recent Chat */}
      <div className="chat-history">
        {chatHistory.slice(-10).map((msg, index) => ( // Show only the last 10 messages
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

      {/* Message Input Form */}
      <form className="chat-form" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>

      {/* Button to View Full Chat History */}
      <button onClick={() => navigate("/chat-history")} className="view-history-button">
        View Full Chat History
      </button>
    </div>
  );
};

export default Chat;