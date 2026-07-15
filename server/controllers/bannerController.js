import Banner from "../models/Banner.js";
import cloudinary from "../config/cloudinary.js";

export const createBanner = async (req, res) => {
  try {
    let image = req.body.image;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "banners",
      });

      image = result.secure_url;
    }

    const banner = await Banner.create({
      title: req.body.title,
      subtitle: req.body.subtitle,
      image,
    });

    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        message: "Banner not found",
      });
    }

    banner.title = req.body.title || banner.title;
    banner.subtitle = req.body.subtitle || banner.subtitle;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "banners",
      });

      banner.image = result.secure_url;
    } else if (req.body.image) {
      banner.image = req.body.image;
    }

    const updatedBanner = await banner.save();

    res.json(updatedBanner);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        message: "Banner not found",
      });
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.json({
      message: "Banner deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};