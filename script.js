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

    // Fetch weather data including daily and hourly forecasts
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,humidity_2m_max,windspeed_10m_max,pressure_msl,cloudcover_mean&hourly=temperature_2m,humidity_2m,windspeed_10m,pressure_msl,precipitation_sum,cloudcover&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    if (!weatherData || weatherData.error) {
      throw new Error("Error fetching weather data from Open-Meteo.");
    }

    const { temperature_2m_max, temperature_2m_min, precipitation_sum, humidity_2m_max, windspeed_10m_max, pressure_msl, cloudcover_mean } = weatherData.daily;
    const { temperature_2m, humidity_2m, windspeed_10m, pressure_msl: hourlyPressure, precipitation_sum: hourlyPrecipitation, cloudcover } = weatherData.hourly;

    // Display Daily Forecast
    let dailyForecastHTML = `<h2>${name}, ${country}</h2>`;
    dailyForecastHTML += `<p><strong>Daily Forecast:</strong></p>`;
    dailyForecastHTML += `<table><tr><th>Date</th><th>Max Temp (°C)</th><th>Min Temp (°C)</th><th>Humidity (%)</th><th>Max Wind Speed (km/h)</th><th>Pressure (hPa)</th><th>Cloud Cover (%)</th></tr>`;

    for (let i = 0; i < temperature_2m_max.length; i++) {
      dailyForecastHTML += `
        <tr>
          <td>${new Date(weatherData.daily.time[i]).toLocaleDateString()}</td>
          <td>${temperature_2m_max[i]}</td>
          <td>${temperature_2m_min[i]}</td>
          <td>${humidity_2m_max[i]}</td>
          <td>${windspeed_10m_max[i]}</td>
          <td>${pressure_msl[i]}</td>
          <td>${cloudcover_mean[i]}</td>
        </tr>
      `;
    }
    dailyForecastHTML += `</table>`;

    // Display Hourly Forecast for the first day
    let hourlyForecastHTML = `<p><strong>Hourly Forecast for Today:</strong></p>`;
    hourlyForecastHTML += `<table><tr><th>Time</th><th>Temperature (°C)</th><th>Humidity (%)</th><th>Wind Speed (km/h)</th><th>Pressure (hPa)</th><th>Precipitation (mm)</th><th>Cloud Cover (%)</th></tr>`;

    for (let i = 0; i < temperature_2m.length; i++) {
      hourlyForecastHTML += `
        <tr>
          <td>${new Date(weatherData.hourly.time[i]).toLocaleTimeString()}</td>
          <td>${temperature_2m[i]}</td>
          <td>${humidity_2m[i]}</td>
          <td>${windspeed_10m[i]}</td>
          <td>${hourlyPressure[i]}</td>
          <td>${hourlyPrecipitation[i]}</td>
          <td>${cloudcover[i]}</td>
        </tr>
      `;
    }
    hourlyForecastHTML += `</table>`;

    // Combine both Daily and Hourly forecasts
    weatherInfo.innerHTML = dailyForecastHTML + hourlyForecastHTML;

  } catch (error) {
    weatherInfo.innerHTML = `Error fetching weather data!<br><pre>${error.message}</pre>`;
    console.error("Error: ", error);
  }
}
