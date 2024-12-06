"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs"; // For date manipulation

const PastOutfitsPage = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOutfits = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/getOutfitsByMonth?month=${currentMonth.format("MM")}&year=${currentMonth.format("YYYY")}`
      );
      const data = await response.json();

      if (response.ok) {
        setOutfits(data.outfits);
      } else {
        setError(data.message || "Failed to fetch outfits.");
      }
    } catch (err) {
      setError("An error occurred while fetching outfits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = currentMonth.startOf("month").day(); // 0 = Sunday, 1 = Monday, etc.

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Past Outfits</h1>

      <div className="flex justify-between items-center mb-4">
      <button
    onClick={handlePrevMonth}
    className="text-gray-500 hover:text-gray-800 focus:outline-none"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  </button>
        <h2 className="text-xl font-semibold">
          {currentMonth.format("MMMM YYYY")}
        </h2>
        <button
    onClick={handleNextMonth}
    className="text-gray-500 hover:text-gray-800 focus:outline-none"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5l7 7-7 7"
      />
    </svg>
  </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-7 gap-4">
          {/* Empty days for padding */}
          {Array.from({ length: startDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
            const day = dayIndex + 1;
            const outfit = outfits.find((o) =>
              dayjs(o.createdAt).isSame(currentMonth.date(day), "day")
            );

            return (
              <div
                key={day}
                className="border p-2 rounded shadow flex flex-col items-center"
              >
                <div className="text-sm font-bold">{day}</div>
                {outfit ? (
                  <img
                    src={outfit.imageUrl}
                    alt={outfit.name}
                    className="w-full h-16 object-contain mt-2"
                  />
                ) : (
                  <div className="w-full h-16 bg-gray-200 mt-2"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PastOutfitsPage;
