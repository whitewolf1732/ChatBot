import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Profile.css"; // Import the CSS file

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState({ name: "", email: "" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await axios.get("https://chatbot-tzms.onrender.com/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data); // Ensure the backend returns { name, email }
      } catch (error) {
        console.error("Failed to fetch user details", error);
      }
    };
    fetchUserDetails();
  }, [token]);

  const handleLogout = async () => {
    try {
      await axios.post("https://chatbot-tzms.onrender.com/api/auth/logout", {}, { headers: { Authorization: `Bearer ${token}` } });

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      await axios.put(
        "https://chatbot-tzms.onrender.com/api/user/edit-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Password updated successfully");
      setError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update password");
      setSuccess("");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await axios.delete("https://chatbot-tzms.onrender.com/api/user/delete-account", {
          headers: { Authorization: `Bearer ${token}` },
        });

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/");
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete account");
      }
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="user-details">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      <form className="password-form" onSubmit={handlePasswordUpdate}>
        <h3>Change Password</h3>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Update Password</button>
      </form>

      <div className="actions">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
        <button className="delete-button" onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Profile;