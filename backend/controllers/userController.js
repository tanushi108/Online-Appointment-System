import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import Razorpay from "razorpay";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

import userModel from "../models/userModels.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= GOOGLE LOGIN ================= */
const loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken)
      return res.status(400).json({ success: false, message: "ID Token missing" });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, email_verified, name, picture } = payload;

    if (!email_verified)
      return res.status(401).json({ success: false, message: "Google email not verified" });

    let user = await userModel.findOne({ email });
    if (!user) {
      user = await userModel.create({
        name: name || "Google User",
        email,
        image: picture || "",
        password: "GOOGLE_AUTH",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(401).json({ success: false, message: "Invalid Google token" });
  }
};

/* ================= REGISTER ================= */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.json({ success: false, message: "Missing details" });

    if (!validator.isEmail(email))
      return res.json({ success: false, message: "Enter a valid email" });

    if (password.length < 8)
      return res.json({ success: false, message: "Password must be at least 8 characters" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

/* ================= LOGIN ================= */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User does not exist" });

    if (user.password === "GOOGLE_AUTH")
      return res.json({ success: false, message: "Please login using Google" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

/* ================= PROFILE ================= */
const getProfile = async (req, res) => {
  try {
    const userData = await userModel.findById(req.userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender)
      return res.json({ success: false, message: "Data missing" });

    await userModel.findByIdAndUpdate(req.userId, {
      name,
      phone,
      address: address ? JSON.parse(address) : {},
      dob,
      gender,
    });

    if (imageFile) {
      const upload = await cloudinary.uploader.upload(imageFile.path);
      await userModel.findByIdAndUpdate(req.userId, { image: upload.secure_url });
    }

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

/* ================= APPOINTMENTS ================= */
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;

    // Fetch doctor data
    const docData = await doctorModel.findById(docId);
    if (!docData || !docData.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    // Check if slot is already booked
    const slots = docData.slots_booked || {};
    if (slots[slotDate]?.includes(slotTime)) {
      return res.json({ success: false, message: "Slot not available" });
    }

    // Mark the slot as booked
    slots[slotDate] = [...(slots[slotDate] || []), slotTime];
    await doctorModel.findByIdAndUpdate(docId, { slots_booked: slots });

    // Fetch user data
    const userData = await userModel.findById(req.userId).select("name email phone");

    // Create the appointment
    const appointment = await appointmentModel.create({
      userId: req.userId,
      docId,
      slotDate,
      slotTime,
      amount: docData.fees,
      userData, // ✅ include user info snapshot
      docData: {
        name: docData.name,
        speciality: docData.speciality,
        fees: docData.fees,
        degree: docData.degree,
        image: docData.image,
      }, // ✅ include doctor info snapshot
    });

    res.json({ success: true, message: "Appointment Booked", appointment });
  } catch (error) {
    console.error("Book Appointment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const listAppointment = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find({ userId: req.userId })
      .populate("docId", "name speciality fees");
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment)
      return res.json({ success: false, message: "Appointment not found" });

    if (appointment.userId.toString() !== req.userId)
      return res.json({ success: false, message: "Unauthorized action" });

    appointment.cancelled = true;
    await appointment.save();

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

/* ================= PAYMENTS (RAZORPAY) ================= */
const createRazorpayOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) return res.json({ success: false, message: "Appointment not found" });

    const options = {
      amount: appointment.amount * 100,
      currency: "INR",
      receipt: appointmentId,
    };
    const order = await razorpayInstance.orders.create(options);

    res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.json({ success: false, message: "Payment verification failed" });

    await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true, status: "Paid" });

    res.json({ success: true, message: "Payment successful" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

/* ================= EXPORT ================= */
export {
  registerUser,
  loginUser,
  loginWithGoogle,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  createRazorpayOrder,
  verifyRazorpayPayment,
};
