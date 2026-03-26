# PlanX Project Overview

## Project Structure

- **backend/**
  - Node.js Express server
  - Handles authentication, trip planning, destinations, and external API integration
  - Organized into controllers, middleware, models, routes, and config
  - Key files:
    - `server.js`: Main server entry point
    - `config/db.js`: Database configuration
    - `controllers/`: Business logic for auth, trips, destinations, external APIs
    - `middleware/auth.middleware.js`: Authentication middleware
    - `models/Trip.js`, `models/User.js`: Mongoose models
    - `routes/`: API route definitions
    - `package.json`: Backend dependencies and scripts

- **frontend/**
  - React app (Vite + Tailwind CSS)
  - User interface for trip planning, city exploration, authentication
  - Organized into components, pages, and data
  - Key files:
    - `index.html`: App entry point
    - `src/App.jsx`: Main React component
    - `src/components/`: UI components (Navbar, Footer, HeroSection, etc.)
    - `src/pages/`: Page views (Home, Login, Signup, MyTrips, PlanTrip, ExploreCities, DestinationDetails)
    - `src/data/indiaDestinations.js`: Destination data
    - `package.json`: Frontend dependencies and scripts
    - `tailwind.config.js`, `postcss.config.js`: Tailwind CSS setup
    - `vite.config.js`: Vite configuration

## Features Implemented

### Backend
- User authentication (signup, login)
- Trip planning and management
- Destination data management
- Integration with external APIs
- RESTful API endpoints for frontend consumption
- MongoDB database setup (via Mongoose)

### Frontend
- Responsive UI with Tailwind CSS
- Home page, Explore Cities, Destination Details, My Trips, Plan Trip, Login, Signup
- City cards and curated sections
- Navigation bar and footer
- Data-driven destination exploration

## Current Status
- Project structure and core files are set up
- Major backend and frontend features implemented
- Ready for further development, testing, and deployment

## Next Steps
- Add more features (e.g., trip recommendations, user profiles)
- Improve error handling and validation
- Enhance UI/UX
- Write tests for backend and frontend
- Deploy to production

---
*This document summarizes the current state of the PlanX project as of March 13, 2026.*
