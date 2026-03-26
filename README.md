# TripWise

TripWise is a full-stack travel planning app for exploring cities, generating itineraries, managing trips, and viewing destination details in one place.

## Features

- User signup and login
- City exploration and destination detail pages
- AI-assisted-style itinerary planning flow
- Trip creation, storage, and sharing
- Weather-aware and route-based planning utilities
- Responsive frontend built for modern browsers

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Leaflet
- Backend: Node.js, Express, Mongoose, JWT, bcrypt
- Database: MongoDB
- External integrations: Geoapify, OpenTripMap, weather and travel data services

## Project Structure

```text
TripWise/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- services/
|   `-- server.js
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- data/
|   |   `-- pages/
|   `-- vite.config.js
|-- PROJECT_OVERVIEW.md
`-- README.md
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB connection string

## Environment Setup

Create `backend/.env` with your local values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENTRIPMAP_API_KEY=your_opentripmap_key
GEOAPIFY_API_KEY=your_geoapify_key
```

Notes:

- The backend loads environment variables from `backend/.env`.
- The frontend currently calls the backend at `http://localhost:5000`.

## Installation

Install dependencies in both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Available Scripts

Backend:

- `npm run dev` starts the Express server with nodemon
- `npm start` starts the backend in production mode

Frontend:

- `npm run dev` starts the Vite dev server
- `npm run build` creates a production build
- `npm run preview` previews the production build locally

## Main Routes

Frontend pages:

- `/`
- `/explore`
- `/destination/:cityName`
- `/plan-trip`
- `/my-trips`
- `/bookings`
- `/login`
- `/signup`
- `/itinerary`
- `/trip/:id`
- `/support`

Backend endpoints include:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:id`
- `GET /api/places`
- `POST /api/places`
- `POST /api/travel/route`
- `POST /api/travel/optimize`
- `POST /api/travel/auto-plan`
- `POST /api/travel/weather-replan`
- `GET /api/travel/weather`

## Current Status

The project includes core backend APIs, authentication, city discovery, itinerary generation flows, and trip management screens. It is ready for continued development, testing, and deployment.

## Future Improvements

- Add test coverage for frontend and backend
- Improve validation and error handling
- Move frontend API base URLs into environment variables
- Add deployment configuration
- Expand personalized trip recommendations

## License

This project is currently unlicensed. Add a license if you plan to distribute it publicly.
