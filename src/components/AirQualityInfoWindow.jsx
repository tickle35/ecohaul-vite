import React, { useEffect, useState } from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { getAirQualityByGeoLocation, getAQIColor, getAQIDescription } from '../services/airQualityService';

const AirQualityInfoWindow = ({ position, onCloseClick }) => {
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAirQuality = async () => {
      if (!position || !position.lat || !position.lng) return;
      
      setLoading(true);
      try {
        const data = await getAirQualityByGeoLocation(position.lat, position.lng);
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
  }, [position]);

  return (
    <InfoWindow position={position} onCloseClick={onCloseClick}>
      <div className="p-2 max-w-xs">
        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : error || !airQualityData ? (
          <p className="text-sm text-gray-500">Air quality data unavailable</p>
        ) : (
          <>
            <h3 className="text-sm font-semibold mb-2">Air Quality Index</h3>
            <div className="flex items-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: getAQIColor(airQualityData.aqi) }}
              >
                <span className="text-white font-bold">{airQualityData.aqi}</span>
              </div>
              <div>
                <div className="font-medium text-sm">{getAQIDescription(airQualityData.aqi)}</div>
                <div className="text-xs text-gray-500">{airQualityData.city?.name || 'Unknown location'}</div>
              </div>
            </div>
            {airQualityData.dominentpol && (
              <div className="text-xs mt-1">Main Pollutant: {airQualityData.dominentpol}</div>
            )}
            <div className="text-xs text-gray-400 mt-2">Source: World Air Quality Index Project</div>
          </>
        )}
      </div>
    </InfoWindow>
  );
};

export default AirQualityInfoWindow; 