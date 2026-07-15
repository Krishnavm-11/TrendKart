import express from "express";
import {
  createBanner,
  getBanners,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getBanners);
router.post("/", protect, admin, upload.single("image"), createBanner);
router.put("/:id", protect, admin, upload.single("image"), updateBanner);
router.delete("/:id", protect, admin, deleteBanner);

export default router;