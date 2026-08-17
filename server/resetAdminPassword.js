import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const newPassword = "admin123";

    const hashedPassword = await bcrypt.hash(
      newPassword,
      8
    );

    const admin = await User.findOne({
      email: "admin@gmail.com",
    });

    if (!admin) {
      console.log("Admin user not found");
      process.exit();
    }

    admin.password = hashedPassword;
    admin.role = "admin";

    await admin.save();

    console.log("Admin password updated successfully");
    console.log("Email: admin@gmail.com");
    console.log("Password: admin123");

    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

resetAdminPassword();