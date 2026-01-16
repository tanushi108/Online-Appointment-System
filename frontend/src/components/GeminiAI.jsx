import React, { useState, useContext, useRef, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const AIReceptionist = ({ apiPath }) => {
  const { backendUrl, doctors } = useContext(AppContext);
  const navigate = useNavigate();

  const aiEndpoint = apiPath || `${backendUrl}/api/ai/chat`;

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  const commonQuestions = [
    "How can I book an appointment?",
    "Which doctors are available?",
    "What are the consultation timings?",
    "How can I cancel my appointment?",
  ];

  // ✅ Fixed answers
  const predefinedAnswers = {
    "How can I book an appointment?":
      "You can book an appointment by selecting a doctor or typing: 'Book appointment with Dr Rahul'.",
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // ✅ LOWERCASE-SAFE Doctor name extractor
  const extractDoctorName = (text) => {
    if (!text) return null;

    const match = text.match(/dr\.?\s+[a-z\s]+/i);
    if (!match) return null;

    return match[0]
      .toLowerCase()
      .replace("dr.", "")
      .replace("dr", "")
      .trim();
  };

  // ✅ Booking intent detector
  const isBookingIntent = (text) => {
    const t = text.toLowerCase();
    return t.includes("book") && t.includes("appointment");
  };

  const sendMessage = async (text) => {
    const finalMessage = text ?? message;
    if (!finalMessage.trim()) return;

    setChat((prev) => [...prev, { sender: "user", text: finalMessage }]);
    setMessage("");

    // ✅ 1. Fixed question
    if (predefinedAnswers[finalMessage]) {
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: predefinedAnswers[finalMessage] },
      ]);
      return;
    }

    // ✅ 2. Booking logic
    if (isBookingIntent(finalMessage)) {
      const extractedName = extractDoctorName(finalMessage);

      if (!extractedName) {
        setChat((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "Please mention doctor name. Example: Book appointment with Dr Rahul",
          },
        ]);
        return;
      }

      // ✅ LOWERCASE comparison
      const doctor = doctors.find((doc) =>
        doc.name.toLowerCase().includes(extractedName)
      );

      if (!doctor) {
        setChat((prev) => [
          ...prev,
          { sender: "ai", text: `Doctor not found: ${extractedName}` },
        ]);
        return;
      }

      setChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Opening appointment page for Dr ${doctor.name}...`,
        },
      ]);

      setTimeout(() => {
        navigate(`/appointment/${doctor._id}`);
      }, 800);

      return;
    }

    // ✅ 3. Normal AI chat
    setLoading(true);
    try {
      const res = await axios.post(aiEndpoint, {
        message: finalMessage,
      });

      setChat((prev) => [
        ...prev,
        { sender: "ai", text: res.data?.reply || "I couldn't understand that." },
      ]);
    } catch {
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 bg-blue-600 w-14 h-14 rounded-full text-white shadow-lg"
        >
          💬
        </button>
      )}

      {open && (
        <div className="fixed bottom-20 right-5 w-80 bg-white rounded-xl shadow-xl flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between rounded-t-xl">
            <span>AI Receptionist</span>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          {/* Common Questions */}
          <div className="p-3 border-b bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {commonQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-xs bg-white border px-2 py-1 rounded"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 p-3 overflow-y-auto">
            {chat.map((c, i) => (
              <div key={i} className={c.sender === "user" ? "text-right" : ""}>
                <span className="inline-block px-3 py-1 rounded bg-gray-100 text-sm">
                  {c.text}
                </span>
              </div>
            ))}
            {loading && <p className="text-xs">Typing...</p>}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={() => sendMessage()}
              className="bg-blue-600 text-white px-3 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIReceptionist;
