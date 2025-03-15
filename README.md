# EcoHaul - E-Waste Management Application

EcoHaul is a modern web application for managing electronic waste collection and recycling. It provides a platform for users to request e-waste pickups and for administrators to manage drivers and track collection requests.

## Features

- User authentication and authorization
- Request e-waste collection with location selection on a map
- Track request status and history
- Admin dashboard with analytics
- Driver management for administrators
- Real-time chat support
- AI assistant for e-waste information
- Air Quality Index (AQI) display on maps
  - Real-time air quality data from the World Air Quality Index Project
  - Flag-style markers with color-coded AQI values directly on the map
  - Interactive markers that display detailed air quality information when clicked
  - Coverage for multiple monitoring stations across the visible map area

## Tech Stack

- React 18
- Vite
- Zustand for state management
- React Router for navigation
- Tailwind CSS for styling
- Chart.js for data visualization
- Google Maps API for location services
- Axios for API requests

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Maps API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ecohaul.git
   cd ecohaul-vite
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_AIR_QUALITY_API_KEY=your_air_quality_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To build the application for production:

```
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Page components organized by user role
- `src/store/` - Zustand store for state management
- `src/resources/` - Static assets like images and icons

## Backend API

The application connects to a backend API running at `https://backend-qcnc.onrender.com`. The API configuration can be found in `src/config/api.js`.

## Environment Variables

The following environment variables are required:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_AIR_QUALITY_API_KEY=your_air_quality_api_key
```

To obtain an Air Quality Index API key:
1. Visit the [World Air Quality Index Project](https://aqicn.org/api/)
2. Register for a free API token
3. Add the token to your `.env` file

## License

This project is licensed under the MIT License - see the LICENSE file for details.
