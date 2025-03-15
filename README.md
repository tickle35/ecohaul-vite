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
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
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

The application expects a backend API running at `http://localhost:8080`. Make sure your backend server is running and properly configured.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
