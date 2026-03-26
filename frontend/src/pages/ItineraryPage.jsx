import { useLocation } from "react-router-dom";
import TripWorkspace from "../components/TripWorkspace.jsx";

const ItineraryPage = () => {
  const location = useLocation();

  return <TripWorkspace initialData={location.state || {}} />;
};

export default ItineraryPage;
