// backend/routes/aiBook.js
import express from "express";

const router = express.Router();

/**
 * POST /api/ai/book
 * body: { doctorId?: string, doctorName?: string, startISO?: string }
 * returns: { success, message, calendarLink, appointment }
 *
 * NOTE: This implementation is demo-friendly and does not persist to DB.
 * If you have a real booking controller, replace this with a call to that controller.
 */

router.post("/book", (req, res) => {
  const { doctorId, doctorName, startISO } = req.body || {};

  const name = doctorName || doctorId || "Dr. Demo";

  // default start = tomorrow 10:00 local
  const start = startISO ? new Date(startISO) : (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d;
  })();

  const end = new Date(start.getTime() + 30 * 60000);

  function toGoogleDateUTC(d) {
    const year = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    const ss = String(d.getUTCSeconds()).padStart(2, "0");
    return `${year}${m}${day}T${hh}${mm}${ss}Z`;
  }

  const dates = `${toGoogleDateUTC(start)}/${toGoogleDateUTC(end)}`;
  const text = encodeURIComponent(`Appointment with ${name}`);
  const details = encodeURIComponent("Appointment created via AI receptionist.");
  const location = encodeURIComponent("Clinic / Online");
  const calendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}&sf=true&output=xml`;

  return res.json({
    success: true,
    message: "Appointment created (demo).",
    calendarLink,
    appointment: {
      doctor: name,
      start: start.toISOString(),
      end: end.toISOString(),
    },
  });
});

export default router;