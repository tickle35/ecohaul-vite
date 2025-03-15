import React, { useState, useEffect } from 'react';
import { OverlayView } from '@react-google-maps/api';
import { getAirQualityByGeoLocation, getAQIColor } from '../services/airQualityService';
import { InfoWindow } from '@react-google-maps/api';

const AirQualityMarker = ({ position, onClick }) => {
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);

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

  const handleMarkerClick = () => {
    setShowInfoWindow(!showInfoWindow);
    if (onClick) onClick();
  };

  if (loading || error || !airQualityData) {
    return null;
  }

  const aqi = airQualityData.aqi;
  const color = getAQIColor(aqi);

  return (
    <>
      <OverlayView
        position={position}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        getPixelPositionOffset={(width, height) => ({
          x: -(width / 2),
          y: -height,
        })}
      >
        <div 
          className="cursor-pointer"
          onClick={handleMarkerClick}
        >
          <div className="relative">
            {/* Flag pole */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-700"></div>
            
            {/* Flag with AQI value */}
            <div 
              className="relative top-0 left-0 px-2 py-1 rounded-sm shadow-md flex items-center justify-center font-bold text-white"
              style={{ backgroundColor: color, minWidth: '40px', textAlign: 'center' }}
            >
              {aqi}
            </div>
          </div>
        </div>
      </OverlayView>

      {showInfoWindow && (
        <InfoWindow
          position={position}
          onCloseClick={() => setShowInfoWindow(false)}
        >
          <div className="p-2 max-w-xs">
            <h3 className="text-sm font-semibold mb-2">Air Quality Index</h3>
            <div className="flex items-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: color }}
              >
                <span className="text-white font-bold">{aqi}</span>
              </div>
              <div>
                <div className="font-medium text-sm">
                  {airQualityData.aqi <= 50 ? 'Good' :
                   airQualityData.aqi <= 100 ? 'Moderate' :
                   airQualityData.aqi <= 150 ? 'Unhealthy for Sensitive Groups' :
                   airQualityData.aqi <= 200 ? 'Unhealthy' :
                   airQualityData.aqi <= 300 ? 'Very Unhealthy' : 'Hazardous'}
                </div>
                <div className="text-xs text-gray-500">{airQualityData.city?.name || 'Unknown location'}</div>
              </div>
            </div>
            {airQualityData.dominentpol && (
              <div className="text-xs mt-1">Main Pollutant: {airQualityData.dominentpol}</div>
            )}
            <div className="text-xs text-gray-400 mt-2">Source: World Air Quality Index Project</div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default AirQualityMarker; 