import { useCallback, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ChatBot from "./components/ChatBot.jsx";
import Home from "./pages/Home.js";
import ExploreCities from "./pages/ExploreCities.js";
import DestinationDetails from "./pages/DestinationDetails.js";
import PlanTrip from "./pages/PlanTrip.jsx";
import MyTrips from "./pages/MyTrips.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ItineraryPage from "./pages/ItineraryPage.jsx";
import SharedTripPage from "./pages/SharedTripPage.jsx";
import Support from "./pages/Support.jsx";
import Bookings from "./pages/Bookings.jsx";

const App = () => {
  const [isAuthed, setIsAuthed] = useState(Boolean(localStorage.getItem("token")));
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");

  const refreshAuth = useCallback(() => {
    setIsAuthed(Boolean(localStorage.getItem("token")));
    setUserName(localStorage.getItem("userName") || "");
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    refreshAuth();
  };

  return (
    <div className="app-shell">
      <Navbar isAuthed={isAuthed} userName={userName} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<ExploreCities />} />
        <Route path="/destination/:cityName" element={<DestinationDetails />} />
        <Route path="/plan-trip" element={<PlanTrip />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/login" element={<Login onAuth={refreshAuth} />} />
        <Route path="/signup" element={<Signup onAuth={refreshAuth} />} />
        <Route path="/itinerary" element={<ItineraryPage />} />
        <Route path="/trip/:id" element={<SharedTripPage />} />
        <Route path="/support" element={<Support />} />
      </Routes>
      <ChatBot />
    </div>
  );
};

export default App;
