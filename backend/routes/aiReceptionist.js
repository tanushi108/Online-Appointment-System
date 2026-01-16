import express from "express";
import * as chrono from "chrono-node";

const router = express.Router();

/* ===================== UTILITIES ===================== */

const MINUTES_30 = 30 * 60 * 1000;

const toGoogleDateUTC = (date) => {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
};

const buildCalendarLink = ({
  title = "Appointment",
  details = "",
  location = "Online",
  startDate,
  endDate,
}) => {
  const dates = `${toGoogleDateUTC(startDate)}/${toGoogleDateUTC(endDate)}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates,
    details,
    location,
    sf: "true",
    output: "xml",
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
};

const extractDoctorName = (text = "") => {
  const match = text.match(
    /\bDr\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/
  );
  return match ? match[0] : null;
};

const isFutureDate = (date) => date.getTime() > Date.now();

/* ===================== INTENTS ===================== */

const INTENTS = {
  CANCEL: ["cancel", "delete"],
  BOOK: ["book", "appointment", "schedule", "reserve"],
};

/* ===================== ROUTE ===================== */

router.post("/chat", (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        reply: "Message is required",
      });
    }

    const lowerMsg = message.toLowerCase();

    /* ---------- CANCEL APPOINTMENT ---------- */
    if (
      INTENTS.CANCEL.some((k) => lowerMsg.includes(k)) &&
      lowerMsg.includes("appointment")
    ) {
      return res.json({
        success: true,
        reply:
          "To cancel your appointment, go to My Appointments and click Cancel.",
      });
    }

    /* ---------- BOOK APPOINTMENT ---------- */
    if (INTENTS.BOOK.some((k) => lowerMsg.includes(k))) {
      const doctor = extractDoctorName(message);
      const parsedDates = chrono.parse(message, new Date(), {
        forwardDate: true,
      });

      if (!doctor && parsedDates.length === 0) {
        return res.json({
          success: true,
          reply:
            "I can help book an appointment. Please mention the doctor name (e.g., Dr. Ava Mitchell) and preferred time.",
        });
      }

      if (!doctor) {
        return res.json({
          success: true,
          reply:
            "Please tell me which doctor you'd like to book with (e.g., Dr. Ava Mitchell).",
        });
      }

      if (parsedDates.length === 0) {
        return res.json({
          success: true,
          reply: `When would you like to book with ${doctor}? (e.g., tomorrow at 10am)`,
        });
      }

      const { start, end } = parsedDates[0];
      const startDate = start?.date();
      const endDate =
        end?.date() || new Date(startDate.getTime() + MINUTES_30);

      if (!startDate || !isFutureDate(startDate)) {
        return res.json({
          success: true,
          reply:
            "The provided date/time is invalid or in the past. Please provide a future time.",
        });
      }

      const appointment = {
        doctor,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      };

      const calendarLink = buildCalendarLink({
        title: `Appointment with ${doctor}`,
        details: `Booked via AI receptionist. User message: "${message}"`,
        location: "Clinic / Online",
        startDate,
        endDate,
      });

      return res.json({
        success: true,
        reply: `Your appointment with ${doctor} is tentatively booked for ${startDate.toLocaleString()}.`,
        appointment,
        calendarLink,
      });
    }

    /* ---------- GENERAL QUERIES ---------- */
    if (lowerMsg.includes("doctor")) {
      return res.json({
        success: true,
        reply:
          "We have experienced doctors across various specialties. Visit the Doctors page to explore.",
      });
    }

    if (lowerMsg.includes("time") || lowerMsg.includes("timing")) {
      return res.json({
        success: true,
        reply: "Doctors are available from 9 AM to 8 PM.",
      });
    }

    if (lowerMsg.includes("online")) {
      return res.json({
        success: true,
        reply: "Yes, online consultations are available.",
      });
    }

    if (["hi", "hello", "hey"].some((g) => lowerMsg.includes(g))) {
      return res.json({
        success: true,
        reply: "Hello! How can I assist you today?",
      });
    }

    /* ---------- FALLBACK ---------- */
    return res.json({
      success: true,
      reply: "I'm here to help with appointments, doctors, and timings.",
    });
  } catch (error) {
    console.error("AI Receptionist Error:", error);
    return res.status(500).json({
      success: false,
      reply: "Server error. Please try again later.",
    });
  }
});

export default router;
