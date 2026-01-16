import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

/* 🔹 SAFELY NORMALIZE TIME TO HH:mm */
const normalizeTime = (time) => {
  if (!time) return "00:00";

  // Handle AM/PM or 24-hour format
  if (time.toLowerCase().includes("am") || time.toLowerCase().includes("pm")) {
    const date = new Date(`1970-01-01 ${time}`);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  const parts = time.split(":");
  const hours = Number(parts[0]);
  const minutes = Number(parts[1] || 0);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, appointmentRazorpay } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);

  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split("_");
    return `${day} ${months[Number(month)]} ${year}`;
  };

  /* 🔹 Fetch user appointments */
  const getUserAppointments = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message || "Failed to fetch appointments");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  /* 🔹 Cancel appointment */
  const cancelAppointment = async (appointmentId) => {
    if (!token) return toast.warn("Please login first");
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (token) getUserAppointments();
  }, [token]);

  return (
    <div className="px-4 sm:px-8 mt-12">
      <p className="pb-3 font-medium text-zinc-700 border-b">My Appointments</p>

      {appointments.length === 0 && <p className="mt-4 text-gray-500">No appointments found.</p>}

      {appointments.map((item) => {
        // ✅ Handle missing docData or userData gracefully
        const doc = item.docData || {};
        const docName = doc.name || "Unknown Doctor";
        const docSpeciality = doc.speciality || "Speciality not set";
        const docImage = doc.image || "https://via.placeholder.com/150";

        // 📅 DATE & TIME
        const [day, month, year] = (item.slotDate || "01_01_1970").split("_");
        const startDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        const startTime = normalizeTime(item.slotTime);
        const startDateTime = new Date(`${startDate}T${startTime}:00`);
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + 30);
        const endTime = endDateTime.toTimeString().slice(0, 5);

        return (
          <div
            key={item._id}
            className="grid grid-cols-[1fr_2fr] sm:flex sm:gap-6 py-4 border-b gap-4 items-center"
          >
            <img className="w-32 h-32 object-cover bg-indigo-50 rounded" src={docImage} alt={docName} />

            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">{docName}</p>
              <p>{docSpeciality}</p>
              <p className="text-xs mt-1">
                <span className="font-medium">Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>

            {/* Add to calendar button */}
            {!item.cancelled && !item.isCompleted && (
              <add-to-calendar-button
                name={`Appointment with ${docName}`}
                description="Doctor Consultation"
                startDate={startDate}
                startTime={startTime}
                endTime={endTime}
                location="Online Consultation"
                timeZone="Asia/Kolkata"
                options="Google"
                buttonStyle="round"
                size="3"
                addGoogleMeet="true"
              ></add-to-calendar-button>
            )}

            <div className="flex flex-col gap-2 justify-end">
              {/* PAY ONLINE */}
              {/* {!item.cancelled && !item.payment && !item.isCompleted && (
                <button
                  onClick={() => appointmentRazorpay(item._id)}
                  className="border rounded py-2 text-sm text-stone-500 hover:bg-primary hover:text-white transition-all"
                >
                  Pay Online
                </button>
              )} */}

              {/* CANCEL */}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="border rounded py-2 text-sm text-stone-500 hover:bg-red-600 hover:text-white transition-all"
                >
                  Cancel Appointment
                </button>
              )}

              {item.cancelled && (
                <button className="border border-red-500 text-red-500 rounded py-2">
                  Appointment Cancelled
                </button>
              )}

              {item.isCompleted && (
                <button className="border border-green-500 text-green-500 rounded py-2">
                  Completed
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyAppointments;
