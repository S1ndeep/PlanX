import { Link, useLocation, useNavigate } from "react-router-dom";
import TripWorkspace from "../components/TripWorkspace.jsx";

const TripViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const trip = location.state;

  if (!trip) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Trip not available</h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
          This view page needs trip data from My Trips. Open the trip again from your dashboard.
        </p>
        <Link
          to="/my-trips"
          className="mt-8 inline-flex rounded-full border border-[#8edcff]/35 bg-[#0b3b43]/55 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#53d6f7] hover:bg-[#1ec7f3] hover:text-slate-950"
        >
          Back to My Trips
        </Link>
      </div>
    );
  }

  return <TripWorkspace initialData={trip} readOnly showReadOnlyActions={false} />;
};

export default TripViewPage;
