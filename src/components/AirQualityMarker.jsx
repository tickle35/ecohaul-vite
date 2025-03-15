import React, { useState, memo } from 'react';
import { OverlayView, InfoWindow } from '@react-google-maps/api';
import { getAQIColor, getAQIDescription } from '../services/airQualityService';

const AirQualityMarker = ({ position, aqi, station, onClick }) => {
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  // If no AQI value is provided, don't render anything
  if (!aqi || !position || !position.lat || !position.lng) {
    return null;
  }

  const handleMarkerClick = () => {
    setShowInfoWindow(!showInfoWindow);
    if (onClick) onClick();
  };

  const color = getAQIColor(aqi);
  const description = getAQIDescription(aqi);

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
                <div className="font-medium text-sm">{description}</div>
                <div className="text-xs text-gray-500">{station?.station?.name || 'Unknown location'}</div>
              </div>
            </div>
            {station?.dominentpol && (
              <div className="text-xs mt-1">Main Pollutant: {station.dominentpol}</div>
            )}
            <div className="text-xs text-gray-400 mt-2">Source: World Air Quality Index Project</div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(AirQualityMarker); 