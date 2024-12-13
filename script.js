async function getWeather() {
  const city = document.getElementById("city").value.trim();
  const weatherInfo = document.getElementById("weather-info");
  weatherInfo.innerHTML = "Loading...";

  if (!city) {
    weatherInfo.innerHTML = "Please enter a city name!";
    return;
  }

  try {
    // Get latitude and longitude for the city
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      weatherInfo.innerHTML = "City not found!";
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // Fetch detailed weather data
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=precipitation,wind_speed,cloudcover,pressure_msl,dewpoint_2m`
    );
    const weatherData = await weatherRes.json();

    const { 
      temperature, 
      windspeed, 
      weathercode, 
      pressure_msl, 
      dewpoint_2m, 
      precipitation, 
      cloudcover 
    } = weatherData.current_weather;

    // Map weather code to description
    const weatherDescriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
    };

    const conditions = weatherDescriptions[weathercode] || "Unknown";

    // Display detailed weather data
    weatherInfo.innerHTML = `
      <h2>${name}, ${country}</h2>
      <p><strong>Temperature:</strong> ${temperature}°C</p>
      <p><strong>Precipitation:</strong> ${precipitation || 0} mm</p>
      <p><strong>Wind Speed:</strong> ${windspeed} km/h</p>
      <p><strong>Cloud Cover:</strong> ${cloudcover || 0}%</p>
      <p><strong>Pressure:</strong> ${pressure_msl} hPa</p>
      <p><strong>Dew Point:</strong> ${dewpoint_2m}°C</p>
      <p><strong>Conditions:</strong> ${conditions}</p>
    `;
  } catch (error) {
    weatherInfo.innerHTML = "Error fetching weather data!";
    console.error(error);
  }
}
