import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const OPEN_WEATHER_API_KEY = "bde1b94767a994962ed1706b7ab10f8a";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: "Latitude and longitude are required." });
  }

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
      params: {
        lat,
        lon,
        appid: OPEN_WEATHER_API_KEY,
        units: "imperial", // Metric units for temperature
      },
    });

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error fetching weather forecast:", error.message);
    res.status(500).json({ message: "Failed to fetch weather data." });
  }
}
