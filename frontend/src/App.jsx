import { useCallback, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ChatBot from "./components/ChatBot.jsx";
import Home from "./pages/Home.js";
import ExploreCities from "./pages/ExploreCities.js";
import DestinationDetails from "./pages/DestinationDetails.js";
import PlanTrip from "./pages/PlanTrip.jsx";

import MyTrips from "./pages/MyTrips.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ItineraryPage from "./pages/ItineraryPage.jsx";
import SharedTripPage from "./pages/SharedTripPage.jsx";
import Support from "./pages/Support.jsx";
import Bookings from "./pages/Bookings.jsx";
import TripViewPage from "./pages/TripViewPage.jsx";
import DirectionsPage from "./pages/DirectionsPage.jsx";

const App = () => {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(Boolean(localStorage.getItem("token")));
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");

  const refreshAuth = useCallback(() => {
    setIsAuthed(Boolean(localStorage.getItem("token")));
    setUserName(localStorage.getItem("userName") || "");
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    const syncAuth = () => refreshAuth();

    window.addEventListener("storage", syncAuth);
    window.addEventListener("tripwise-auth-changed", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("tripwise-auth-changed", syncAuth);
    };
  }, [refreshAuth]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userProfilePicture");
    window.dispatchEvent(new Event("tripwise-auth-changed"));
    refreshAuth();
    navigate("/login", { replace: true });
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/itinerary" element={<ItineraryPage />} />
        <Route path="/trip-view" element={<TripViewPage />} />
        <Route path="/trip-directions" element={<DirectionsPage />} />
        <Route path="/trip/:id" element={<SharedTripPage />} />
        <Route path="/support" element={<Support />} />
      </Routes>
      <ChatBot />
    </div>
  );
};

export default App;
