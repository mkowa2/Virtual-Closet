"use client";

import { useEffect, useState } from "react";

const WeatherPage = () => {
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [weather, setWeather] = useState(null);
  const [outfit, setOutfit] = useState(null);
  const [recommendationText, setRecommendationText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lon: longitude });
          },
          (err) => {
            console.error("Error fetching location:", err);
            setError("Could not fetch location. Please enable location services.");
          }
        );
      } else {
        setError("Geolocation is not supported by your browser.");
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!location.lat || !location.lon) return;

      try {
        const response = await fetch(`/api/getWeatherForecast?lat=${location.lat}&lon=${location.lon}`);
        const data = await response.json();

        if (response.ok) {
          setWeather(data);
        } else {
          setError(data.message || "Failed to fetch weather data.");
        }
      } catch (err) {
        console.error("Error fetching weather data:", err);
        setError("Failed to fetch weather data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  const handleGetRecommendation = async () => {
    if (!weather) return;

    const userId = "user_id_from_auth"; // Replace with Clerk or auth logic
    const weatherCondition = weather.list[0].weather[0].main;
    const temperature = weather.list[0].main.temp;

    console.log("Requesting recommendation with:", { userId, weatherCondition, temperature });

    try {
      const response = await fetch("/api/getRecommendedOutfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, weatherCondition, temperature }),
      });

      const data = await response.json();
      console.log("Recommended Outfit Response:", data);

      if (response.ok) {
        setOutfit(data.recommendedOutfit);
        setRecommendationText(data.recommendationText);
      } else {
        setError(data.message || "Failed to fetch recommended outfit.");
      }
    } catch (err) {
      console.error("Error fetching recommended outfit:", err);
      setError("Failed to fetch recommended outfit.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Weather & Recommended Outfit</h1>
      <div className="mb-6">
        <p>
          <strong>Temperature:</strong> {weather.list[0].main.temp}°F
        </p>
        <p>
          <strong>Condition:</strong> {weather.list[0].weather[0].main}
        </p>
      </div>
      <button
        onClick={handleGetRecommendation}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Get Recommended Outfit
      </button>

      {outfit && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Recommended Outfit</h2>
          <div className="flex flex-col items-center">
            {outfit.top && (
              <div className="mb-4">
                <img src={outfit.top.imageUrl} alt="Top" className="w-40 h-40 object-contain" />
                <p>{outfit.top.name}</p>
              </div>
            )}
            {outfit.bottom && (
              <div className="mb-4">
                <img src={outfit.bottom.imageUrl} alt="Bottom" className="w-40 h-40 object-contain" />
                <p>{outfit.bottom.name}</p>
              </div>
            )}
            {outfit.shoes && (
              <div className="mb-4">
                <img src={outfit.shoes.imageUrl} alt="Shoes" className="w-40 h-40 object-contain" />
                <p>{outfit.shoes.name}</p>
              </div>
            )}
            {outfit.accessory && (
              <div className="mb-4">
                <img src={outfit.accessory.imageUrl} alt="Accessory" className="w-40 h-40 object-contain" />
                <p>{outfit.accessory.name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {recommendationText && <p className="mt-4 text-gray-600">{recommendationText}</p>}
    </div>
  );
};

export default WeatherPage;
