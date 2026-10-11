
import mongoose from "mongoose";

const authOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    purpose: {
      type: String,
      enum: ["register", "login"],
      required: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    name: {
      type: String,
    },

    passwordHash: {
      type: String,
    },

    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Only one active OTP for each email and purpose.
authOtpSchema.index(
  { email: 1, purpose: 1 },
  { unique: true }
);

export default mongoose.model("AuthOtp", authOtpSchema);