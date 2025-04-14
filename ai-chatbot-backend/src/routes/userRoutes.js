import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Get User Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password only
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user); // This will include the `name` field
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error });
  }
});
// Edit User Profile
router.put("/edit-profile", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error });
  }
});

// Edit User Password
router.put("/edit-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and update the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update password", error });
  }
});

// Delete Account (Also deletes chat history)
router.delete("/delete-account", authMiddleware, async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.user.id }); // Delete all chats
    await User.findByIdAndDelete(req.user.id); // Delete user account

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete account", error });
  }
});

export default router;