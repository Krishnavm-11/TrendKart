import User from "../models/User.js";
import AuthOtp from "../models/AuthOtp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Convert email to lowercase and remove extra spaces.
function cleanEmail(email = "") {
  return email.trim().toLowerCase();
}

// Check whether the email format is valid.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Create a JWT token after successful authentication.
function makeToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Send only the required user details to the frontend.
function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// Send the OTP through email.
async function sendOtpEmail(email, otp, purpose) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    EMAIL_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("Email service is not configured. Check your .env file.");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to: email,
    subject:
      purpose === "register"
        ? "Verify your TrendKart account"
        : "Your TrendKart login code",
    text: `Your TrendKart OTP is ${otp}. It expires in 10 minutes. Do not share this code.`,
    html: `
      <div style="font-family: Arial; padding: 25px;">
        <h2>TrendKart</h2>
        <p>Your email verification code is:</p>
        <h1 style="letter-spacing: 8px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>Do not share this code with anyone.</p>
      </div>
    `,
  });
}

// Generate a new OTP, save its hash and send the email.
async function createAndSendOtp({
  email,
  purpose,
  name,
  passwordHash,
}) {
  const otp = String(
    Math.floor(100000 + Math.random() * 900000)
  );

  // Hash the OTP before saving it.
  const otpHash = await bcrypt.hash(otp, 10);

  // Remove the previous OTP for this action.
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
    // Remove the record if the email could not be sent.
    await AuthOtp.deleteOne({ email, purpose });
    throw error;
  }
}

// EXISTING REGISTRATION ENDPOINT
// Kept for compatibility with existing project code.
export const registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all the fields.",
      });
    }

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists. Please log in instead.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists. Please log in instead.",
      });
    }

    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
};

// EXISTING LOGIN ENDPOINT
// Kept for compatibility with the existing admin login.
export const loginUser = async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter your email and password.",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    return res.json({
      token: makeToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};

// STEP 1: VALIDATE REGISTRATION AND SEND OTP
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
        message: "Password must have at least 8 characters, one letter and one number.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered. Please go back and log in.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await createAndSendOtp({
      email,
      purpose: "register",
      name,
      passwordHash,
    });

    return res.json({
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("Registration OTP error:", error.message);

    return res.status(500).json({
      message: error.message.includes("Email service is not configured")
        ? error.message
        : "We couldn't send the OTP. Please check your email settings.",
    });
  }
};

// STEP 1: CHECK LOGIN DETAILS AND SEND OTP
export const sendLoginOtp = async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!emailPattern.test(email) || !password) {
      return res.status(400).json({
        message: "Enter a valid email and password.",
      });
    }

   // Find the user by email
const user = await User.findOne({ email });

if (!user) {
  return res.status(404).json({
    message: "No account found with this email address.",
  });
}

// Check the password
const isPasswordCorrect = await bcrypt.compare(
  password,
  user.password
);

if (!isPasswordCorrect) {
  return res.status(401).json({
    message: "Incorrect password. Please try again.",
  });
}

    // Admins continue using the existing admin login page.
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Please use the Admin Login page for this account.",
      });
    }

    await createAndSendOtp({
      email,
      purpose: "login",
    });

    return res.json({
      message: "Login verification code sent to your email.",
    });
  } catch (error) {
    console.error("Login OTP error:", error.message);

    return res.status(500).json({
      message: error.message.includes("Email service is not configured")
        ? error.message
        : "We couldn't send the OTP. Please try again.",
    });
  }
};

// STEP 2: VERIFY OTP AND COMPLETE LOGIN OR REGISTRATION
export const verifyAuthOtp = async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    const purpose = req.body.purpose;

    if (
      !emailPattern.test(email) ||
      !/^\d{6}$/.test(otp) ||
      !["register", "login"].includes(purpose)
    ) {
      return res.status(400).json({
        message: "Please enter the 6-digit verification code.",
      });
    }

    const record = await AuthOtp.findOne({ email, purpose });

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

    const correctOtp = await bcrypt.compare(otp, record.otpHash);

    if (!correctOtp) {
      record.attempts += 1;
      await record.save();

      return res.status(400).json({
        message: `Incorrect OTP. ${5 - record.attempts} attempts remaining.`,
      });
    }

    let user;

    if (purpose === "register") {
      // Check again before creating the account.
      if (await User.findOne({ email })) {
        await AuthOtp.deleteOne({ _id: record._id });

        return res.status(409).json({
          message: "This email is already registered. Please log in.",
        });
      }

      user = await User.create({
        name: record.name,
        email,
        password: record.passwordHash,
      });
    } else {
      user = await User.findOne({ email });

      if (!user) {
        await AuthOtp.deleteOne({ _id: record._id });

        return res.status(404).json({
          message: "Account not found. Please register first.",
        });
      }
    }

    // OTP is no longer needed after successful verification.
    await AuthOtp.deleteOne({ _id: record._id });

    return res.json({
      message:
        purpose === "register"
          ? "Email verified. Your account is ready!"
          : "Login successful.",
      token: makeToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered. Please log in.",
      });
    }

    console.error("OTP verification error:", error.message);

    return res.status(500).json({
      message: "We couldn't verify the code. Please try again.",
    });
  }
};

// Get all registered users for the admin dashboard
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