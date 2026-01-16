// frontend/src/components/DemoBanner.jsx
import React from "react";
import { Link } from "react-router-dom";

const DemoBanner = () => {
  return (
    <div className="fixed left-4 bottom-4 z-50">
      <Link to="/demo">
        <button className="bg-green-600 text-white px-4 py-2 rounded shadow-lg">
          Try Live Demo
        </button>
      </Link>
    </div>
  );
};

export default DemoBanner;