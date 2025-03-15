import React, { useState, useEffect } from 'react';
import { getAirQualityByGeoLocation, getAQIColor, getAQIDescription } from '../services/airQualityService';

const AirQualityIndicator = ({ lat, lng, className = '' }) => {
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAirQuality = async () => {
      if (!lat || !lng) return;
      
      setLoading(true);
      try {
        const data = await getAirQualityByGeoLocation(lat, lng);
        if (data && data.status === 'ok') {
          setAirQualityData(data.data);
        } else {
          setError('Could not fetch air quality data');
        }
      } catch (err) {
        setError('Error fetching air quality data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAirQuality();
  }, [lat, lng]);

  if (loading) {
    return (
      <div className={`bg-white rounded-md shadow-md p-3 ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !airQualityData) {
    return (
      <div className={`bg-white rounded-md shadow-md p-3 ${className}`}>
        <p className="text-sm text-gray-500">Air quality data unavailable</p>
      </div>
    );
  }

  const aqi = airQualityData.aqi;
  const color = getAQIColor(aqi);
  const description = getAQIDescription(aqi);

  return (
    <div className={`bg-white rounded-md shadow-md p-3 ${className}`}>
      <h3 className="text-sm font-semibold mb-2">Air Quality Index</h3>
      <div className="flex items-center">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
          style={{ backgroundColor: color }}
        >
          <span className="text-white font-bold">{aqi}</span>
        </div>
        <div>
          <div className="font-medium text-sm">{description}</div>
          <div className="text-xs text-gray-500">{airQualityData.city?.name || 'Unknown location'}</div>
        </div>
      </div>
      {airQualityData.dominentpol && (
        <div className="text-xs mt-1">Main Pollutant: {airQualityData.dominentpol}</div>
      )}
    </div>
  );
};

export default AirQualityIndicator; 