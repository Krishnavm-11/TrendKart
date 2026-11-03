
import User from "../models/User.js";
import AuthOtp from "../models/AuthOtp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomInt } from "node:crypto";

// Normalize email addresses.
function cleanEmail(email = "") {
  return String(email).trim().toLowerCase();
}

// Validate email format.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Create JWT token.
function makeToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Return safe user details.
function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// Send OTP through Google Apps Script.
async function sendOtpEmail(email, otp, purpose) {
  const { MAIL_API_URL, MAIL_API_SECRET } = process.env;

  if (!MAIL_API_URL || !MAIL_API_SECRET) {
    throw new Error(
      "Email service is not configured. Check MAIL_API_URL and MAIL_API_SECRET."
    );
  }

  try {
    const response = await fetch(MAIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: MAIL_API_SECRET,
        to: email,
        otp: String(otp),
        purpose,
      }),
      signal: AbortSignal.timeout(20000),
    });

    const responseText = await response.text();

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(
        "Invalid response from Google Apps Script. Check the Web App deployment."
      );
    }

    if (!response.ok || result.success !== true) {
      throw new Error(
        result.message || `Email API failed with status ${response.status}`
      );
    }

    console.log("Registration OTP email sent successfully.");

  } catch (error) {
    console.error("OTP email sending failed:", error.message);
    throw error;
  }
}

// Generate OTP, save its hash, and send email.
async function createAndSendOtp({
  email,
  purpose,
  name,
  passwordHash,
}) {
  const otp = String(randomInt(100000, 1000000));

  const otpHash = await bcrypt.hash(otp, 10);

  await AuthOtp.deleteOne({ email, purpose });

  await AuthOtp.create({
    email,
    purpose,
    otpHash,
    name,
    passwordHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  try {
    await sendOtpEmail(email, otp, purpose);
  } catch (error) {
    await AuthOtp.deleteOne({ email, purpose });
    throw error;
  }
}

// Normal login using email and password.
// No OTP required.
export const loginUser = async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter your email and password.",
      });
    }

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    return res.status(200).json({
      message: "Login successful.",
      token: makeToken(user),
      user: publicUser(user),
    });

  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};

// Validate registration details and send OTP.
export const sendRegisterOtp = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || "");

    if (name.length < 2) {
      return res.status(400).json({
        message: "Please enter your full name.",
      });
    }

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (
      password.length < 8 ||
      !/[A-Za-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return res.status(400).json({
        message:
          "Password must have at least 8 characters, one letter and one number.",
      });
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({
        message:
          "This email is already registered. Please go back and log in.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await createAndSendOtp({
      email,
      purpose: "register",
      name,
      passwordHash,
    });

    return res.status(200).json({
      message: "Verification code sent to your email.",
    });

  } catch (error) {
    console.error("Registration OTP error:", error.message);

    return res.status(500).json({
      message:
        error.message ||
        "We couldn't send the OTP. Please check your email settings.",
    });
  }
};

// Verify registration OTP and create account.
export const verifyAuthOtp = async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    const purpose = req.body.purpose;

    // Only registration OTP is accepted.
    if (
      !emailPattern.test(email) ||
      !/^\d{6}$/.test(otp) ||
      purpose !== "register"
    ) {
      return res.status(400).json({
        message: "Please enter the 6-digit verification code.",
      });
    }

    const record = await AuthOtp.findOne({
      email,
      purpose: "register",
    });

    if (!record || record.expiresAt.getTime() <= Date.now()) {
      if (record) {
        await AuthOtp.deleteOne({ _id: record._id });
      }

      return res.status(400).json({
        message: "Your OTP has expired. Please request a new code.",
      });
    }

    if (record.attempts >= 5) {
      await AuthOtp.deleteOne({ _id: record._id });

      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    const correctOtp = await bcrypt.compare(
      otp,
      record.otpHash
    );

    if (!correctOtp) {
      record.attempts += 1;
      await record.save();

      return res.status(400).json({
        message: `Incorrect OTP. ${5 - record.attempts} attempts remaining.`,
      });
    }

    // Prevent duplicate account creation.
    if (await User.findOne({ email })) {
      await AuthOtp.deleteOne({ _id: record._id });

      return res.status(409).json({
        message: "This email is already registered. Please log in.",
      });
    }

    // Create account only after successful OTP verification.
    const user = await User.create({
      name: record.name,
      email,
      password: record.passwordHash,
    });

    await AuthOtp.deleteOne({ _id: record._id });

    return res.status(201).json({
      message: "Email verified. Your account is ready!",
      token: makeToken(user),
      user: publicUser(user),
    });

  } catch (error) {
    console.error("OTP verification error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered. Please log in.",
      });
    }

    return res.status(500).json({
      message: "We couldn't verify the code. Please try again.",
    });
  }
};

// Get all users for admin dashboard.
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      totalUsers: users.length,
      users,
    });

  } catch (error) {
    console.error("Fetch users error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch users.",
    });
  }
};
