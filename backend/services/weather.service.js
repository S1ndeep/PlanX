import axios from "axios";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

const weatherCodeMap = {
  0: { label: "Clear", icon: "sunny" },
  1: { label: "Mostly clear", icon: "partly-cloudy" },
  2: { label: "Partly cloudy", icon: "partly-cloudy" },
  3: { label: "Cloudy", icon: "cloudy" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Depositing rime fog", icon: "fog" },
  51: { label: "Light drizzle", icon: "drizzle" },
  53: { label: "Drizzle", icon: "drizzle" },
  55: { label: "Dense drizzle", icon: "drizzle" },
  61: { label: "Light rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  71: { label: "Light snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  80: { label: "Rain showers", icon: "rain" },
  81: { label: "Heavy showers", icon: "rain" },
  95: { label: "Thunderstorm", icon: "storm" }
};

export const getDailyForecast = async ({ latitude, longitude, days = 3 }) => {
  console.log("Open-Meteo forecast request", {
    url: OPEN_METEO_URL,
    latitude,
    longitude,
    days
  });

  const response = await axios.get(OPEN_METEO_URL, {
    params: {
      latitude,
      longitude,
      daily: "weather_code,temperature_2m_max,temperature_2m_min",
      forecast_days: days,
      timezone: "auto"
    },
    timeout: 10000
  });

  const daily = response.data.daily || {};
  const time = daily.time || [];

  return time.map((date, index) => {
    const code = daily.weather_code?.[index] ?? 0;
    const mapped = weatherCodeMap[code] || { label: "Unknown", icon: "cloudy" };

    return {
      date,
      temperatureMax: Math.round(daily.temperature_2m_max?.[index] ?? 0),
      temperatureMin: Math.round(daily.temperature_2m_min?.[index] ?? 0),
      condition: mapped.label,
      icon: mapped.icon,
      weatherCode: code
    };
  });
};
