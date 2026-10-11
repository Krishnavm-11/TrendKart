import express from "express";
import User from "../models/User.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/admin/users
// Get all users for the admin panel.
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Get admin users error:", error);

    return res.status(500).json({
      message: "Unable to fetch users.",
    });
  }
});

// DELETE /api/admin/users/:id
// Delete a customer account.
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Do not allow this route to delete admin accounts.
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin accounts cannot be deleted here.",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete admin user error:", error);

    return res.status(500).json({
      message: "Unable to delete user.",
    });
  }
});

export default router;