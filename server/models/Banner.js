import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    subtitle: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);