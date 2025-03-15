import axios from 'axios';

const API_KEY = import.meta.env.VITE_AIR_QUALITY_API_KEY;
const BASE_URL = 'https://api.waqi.info/feed';

/**
 * Fetches air quality data for a specific location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise} - Promise with air quality data
 */
export const getAirQualityByGeoLocation = async (lat, lng) => {
  try {
    const response = await axios.get(`${BASE_URL}/geo:${lat};${lng}/?token=${API_KEY}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return null;
  }
};

/**
 * Gets the color based on AQI value
 * @param {number} aqi - Air Quality Index value
 * @returns {string} - Color code
 */
export const getAQIColor = (aqi) => {
  if (aqi <= 50) {
    return '#009966'; // Good - Green
  } else if (aqi <= 100) {
    return '#FFDE33'; // Moderate - Yellow
  } else if (aqi <= 150) {
    return '#FF9933'; // Unhealthy for Sensitive Groups - Orange
  } else if (aqi <= 200) {
    return '#CC0033'; // Unhealthy - Red
  } else if (aqi <= 300) {
    return '#660099'; // Very Unhealthy - Purple
  } else {
    return '#7E0023'; // Hazardous - Maroon
  }
};

/**
 * Gets the description based on AQI value
 * @param {number} aqi - Air Quality Index value
 * @returns {string} - Description
 */
export const getAQIDescription = (aqi) => {
  if (aqi <= 50) {
    return 'Good';
  } else if (aqi <= 100) {
    return 'Moderate';
  } else if (aqi <= 150) {
    return 'Unhealthy for Sensitive Groups';
  } else if (aqi <= 200) {
    return 'Unhealthy';
  } else if (aqi <= 300) {
    return 'Very Unhealthy';
  } else {
    return 'Hazardous';
  }
};

/**
 * Creates an AQI info window content
 * @param {object} data - Air quality data
 * @returns {string} - HTML content for info window
 */
export const createAQIInfoWindowContent = (data) => {
  if (!data || !data.aqi) {
    return '<div>No air quality data available</div>';
  }
  
  const aqi = data.aqi;
  const color = getAQIColor(aqi);
  const description = getAQIDescription(aqi);
  
  return `
    <div style="padding: 10px; max-width: 200px;">
      <h3 style="margin: 0 0 8px; font-size: 16px;">Air Quality Index</h3>
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background-color: ${color}; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
          <span style="color: white; font-weight: bold;">${aqi}</span>
        </div>
        <div>
          <div style="font-weight: bold;">${description}</div>
          <div style="font-size: 12px;">${data.city?.name || 'Unknown location'}</div>
        </div>
      </div>
      ${data.dominentpol ? `<div style="font-size: 12px;">Main Pollutant: ${data.dominentpol}</div>` : ''}
      <div style="font-size: 10px; margin-top: 8px;">Source: World Air Quality Index Project</div>
    </div>
  `;
};

export default {
  getAirQualityByGeoLocation,
  getAQIColor,
  getAQIDescription,
  createAQIInfoWindowContent
}; 