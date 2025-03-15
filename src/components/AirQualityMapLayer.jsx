import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AirQualityMarker from './AirQualityMarker';

const API_KEY = import.meta.env.VITE_AIR_QUALITY_API_KEY;
const BASE_URL = 'https://api.waqi.info/map/bounds';

const AirQualityMapLayer = ({ bounds, mapRef }) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAirQualityStations = async () => {
      if (!bounds) return;
      
      const { north, south, east, west } = bounds;
      
      setLoading(true);
      try {
        const response = await axios.get(
          `${BASE_URL}/?latlng=${south},${west},${north},${east}&token=${API_KEY}`
        );
        
        if (response.data && response.data.status === 'ok') {
          setStations(response.data.data || []);
        } else {
          setError('Could not fetch air quality stations');
        }
      } catch (err) {
        setError('Error fetching air quality stations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (bounds) {
      fetchAirQualityStations();
    }
  }, [bounds]);

  // Listen for map bounds changes
  useEffect(() => {
    if (!mapRef || !mapRef.current) return;

    const map = mapRef.current;
    
    const boundsChangedListener = map.addListener('bounds_changed', () => {
      const newBounds = map.getBounds();
      if (newBounds) {
        const ne = newBounds.getNorthEast();
        const sw = newBounds.getSouthWest();
        
        const newBoundsObj = {
          north: ne.lat(),
          east: ne.lng(),
          south: sw.lat(),
          west: sw.lng()
        };
        
        // Only update if bounds have changed significantly
        if (
          !bounds || 
          Math.abs(bounds.north - newBoundsObj.north) > 0.01 ||
          Math.abs(bounds.south - newBoundsObj.south) > 0.01 ||
          Math.abs(bounds.east - newBoundsObj.east) > 0.01 ||
          Math.abs(bounds.west - newBoundsObj.west) > 0.01
        ) {
          // This will trigger the fetchAirQualityStations effect
          bounds = newBoundsObj;
        }
      }
    });

    return () => {
      // Clean up listener when component unmounts
      if (boundsChangedListener) {
        window.google.maps.event.removeListener(boundsChangedListener);
      }
    };
  }, [mapRef, bounds]);

  if (loading || error || !stations.length) {
    return null;
  }

  return (
    <>
      {stations.map((station) => (
        <AirQualityMarker
          key={station.uid}
          position={{ lat: station.lat, lng: station.lon }}
        />
      ))}
    </>
  );
};

export default AirQualityMapLayer; 