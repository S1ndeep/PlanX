import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { joinGroupByInvite } from "../api/advancedTravelApi.js";

const JoinGroupPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [groupTrip, setGroupTrip] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const runJoin = async () => {
      setLoading(true);
      setError("");

      try {
        const joinedGroup = await joinGroupByInvite(token);
        setGroupTrip(joinedGroup);
      } catch (joinError) {
        setError(joinError.response?.data?.message || "Unable to join this group right now.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      runJoin();
      return;
    }

    setError("Invalid invite token.");
    setLoading(false);
  }, [token]);

  return (
    <main className="min-h-screen bg-[#062f35] px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-white/10 bg-[rgba(8,42,48,0.72)] p-8 text-white shadow-[0_30px_90px_rgba(2,16,22,0.24)] backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">TripWise Groups</p>
        <h1 className="mt-4 text-3xl font-semibold">Join shared trip group</h1>

        {loading && <p className="mt-5 text-white/75">Joining group...</p>}

        {!loading && error && (
          <div className="mt-5 rounded-lg border border-red-300/25 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100">
            {error}
          </div>
        )}

        {!loading && groupTrip && (
          <div className="mt-5 rounded-lg border border-[#4dd4ff]/25 bg-[#4dd4ff]/10 p-4">
            <p className="text-sm text-cyan-50">You joined:</p>
            <p className="mt-1 text-xl font-semibold text-white">{groupTrip.name}</p>
            <p className="mt-2 text-sm text-white/75">Destination: {groupTrip.destination || "Not set yet"}</p>
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/trip-groups"
            className="rounded-lg bg-[#4dd4ff] px-5 py-3 text-sm font-bold text-slate-950"
          >
            Open Groups Workspace
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default JoinGroupPage;
