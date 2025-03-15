import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AirQualityMarker from './AirQualityMarker';

const API_KEY = import.meta.env.VITE_AIR_QUALITY_API_KEY;
const BASE_URL = 'https://api.waqi.info/map/bounds';

// Define multiple regions to cover major populated areas around the world
const WORLD_REGIONS = [
  // Africa
  { north: 37.0, south: -35.0, east: 50.0, west: -20.0 },
  // Europe
  { north: 70.0, south: 35.0, east: 40.0, west: -10.0 },
  // Asia
  { north: 55.0, south: -10.0, east: 145.0, west: 60.0 },
  // North America
  { north: 70.0, south: 15.0, east: -50.0, west: -170.0 },
  // South America
  { north: 15.0, south: -55.0, east: -35.0, west: -80.0 },
  // Australia and Oceania
  { north: 0.0, south: -50.0, east: 180.0, west: 110.0 },
];

// Fallback to Accra, Ghana if no bounds are provided
const DEFAULT_BOUNDS = {
  north: 5.7037,
  south: 5.5037,
  east: -0.0870,
  west: -0.2870
};

const AirQualityMapLayer = ({ bounds, mapRef }) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  // Function to fetch air quality stations for a specific region
  const fetchRegionAirQualityStations = useCallback(async (region) => {
    const { north, south, east, west } = region;
    console.log('Fetching air quality data for region:', { north, south, east, west });
    
    try {
      const response = await axios.get(
        `${BASE_URL}/?latlng=${south},${west},${north},${east}&token=${API_KEY}`
      );
      
      if (response.data && response.data.status === 'ok') {
        console.log(`Air quality data received for region: ${response.data.data?.length || 0} stations`);
        return response.data.data || [];
      } else {
        console.error('Failed to fetch air quality data for region:', response.data);
        return [];
      }
    } catch (err) {
      console.error('Error fetching air quality stations for region:', err);
      return [];
    }
  }, []);

  // Function to fetch air quality stations for all defined world regions
  const fetchAllWorldAirQualityStations = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching air quality data for all world regions');
      
      // Fetch data for all regions in parallel
      const allRegionsPromises = WORLD_REGIONS.map(region => 
        fetchRegionAirQualityStations(region)
      );
      
      const allRegionsResults = await Promise.all(allRegionsPromises);
      
      // Combine all results and remove duplicates based on station UID
      const combinedStations = [];
      const stationIds = new Set();
      
      allRegionsResults.forEach(regionStations => {
        regionStations.forEach(station => {
          if (!stationIds.has(station.uid)) {
            stationIds.add(station.uid);
            combinedStations.push(station);
          }
        });
      });
      
      console.log(`Total air quality stations after combining regions: ${combinedStations.length}`);
      setStations(combinedStations);
      setDataFetched(true);
    } catch (err) {
      console.error('Error fetching world air quality stations:', err);
      setError('Error fetching world air quality stations');
    } finally {
      setLoading(false);
    }
  }, [fetchRegionAirQualityStations]);

  // Initial fetch when component mounts - fetch for the entire world
  useEffect(() => {
    console.log('AirQualityMapLayer mounted - fetching global data');
    if (!dataFetched) {
      fetchAllWorldAirQualityStations();
    }
  }, [fetchAllWorldAirQualityStations, dataFetched]);

  // Also fetch data for the current visible bounds to ensure we have the most up-to-date data
  // for the area the user is viewing
  useEffect(() => {
    if (bounds && mapRef?.current) {
      const fetchVisibleAreaData = async () => {
        try {
          const newStations = await fetchRegionAirQualityStations(bounds);
          
          // Update existing stations with new data and add any new stations
          setStations(prevStations => {
            const stationMap = new Map();
            
            // Add existing stations to map
            prevStations.forEach(station => {
              stationMap.set(station.uid, station);
            });
            
            // Update or add new stations
            newStations.forEach(station => {
              stationMap.set(station.uid, station);
            });
            
            return Array.from(stationMap.values());
          });
        } catch (error) {
          console.error('Error updating visible area data:', error);
        }
      };
      
      fetchVisibleAreaData();
    }
  }, [bounds, mapRef, fetchRegionAirQualityStations]);

  // Refresh data periodically (every 15 minutes)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Refreshing global air quality data');
      fetchAllWorldAirQualityStations();
    }, 15 * 60 * 1000); // 15 minutes
    
    return () => clearInterval(refreshInterval);
  }, [fetchAllWorldAirQualityStations]);

  if (loading && !stations.length) {
    console.log('Initial air quality data loading...');
    return null;
  }

  if (error && !stations.length) {
    console.error('Air quality error:', error);
    return null;
  }

  console.log('Rendering', stations.length, 'air quality markers');
  return (
    <>
      {stations.map((station) => (
        <AirQualityMarker
          key={station.uid}
          position={{ lat: parseFloat(station.lat), lng: parseFloat(station.lon) }}
          aqi={station.aqi}
          station={station}
        />
      ))}
    </>
  );
};

export default AirQualityMapLayer; 