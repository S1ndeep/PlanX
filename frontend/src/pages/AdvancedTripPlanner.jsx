import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AiPlannerPanel from "../components/advanced/AiPlannerPanel.jsx";
import CollaborationPanel from "../components/advanced/CollaborationPanel.jsx";
import ExpenseDashboard from "../components/advanced/ExpenseDashboard.jsx";
import RoadTripPlanner from "../components/advanced/RoadTripPlanner.jsx";
import {
  createExpense,
  createGroupTrip,
  createRoadTripPlan,
  deleteGroup,
  estimateExpenses,
  getMyGroups,
  generateAiItinerary,
  getExpenses
} from "../api/advancedTravelApi.js";
import { useI18n } from "../hooks/useI18n.js";

const tabs = ["road", "ai", "groups", "expenses"];

const featureRoutes = {
  road: "/road-trip",
  ai: "/ai-planner",
  groups: "/trip-groups",
  expenses: "/trip-expenses"
};

const AdvancedTripPlanner = ({ defaultTab = "road" }) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("road");
  const [roadForm, setRoadForm] = useState({
    sourceCity: "Mumbai",
    destinationCity: "Goa",
    travelMode: "car",
    budget: "9000"
  });
  const [aiForm, setAiForm] = useState({
    destination: "Jaipur",
    budget: "8000",
    duration: "3",
    interests: ["culture", "food"]
  });
  const [expenseForm, setExpenseForm] = useState({
    title: "Fuel refill",
    amount: "2500",
    category: "fuel"
  });
  const [groupName, setGroupName] = useState("Weekend escape");
  const [roadPlan, setRoadPlan] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [groupResult, setGroupResult] = useState(null);
  const [groupList, setGroupList] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [deletingGroupId, setDeletingGroupId] = useState("");
  const [pendingGroupDeletion, setPendingGroupDeletion] = useState(null);
  const [undoCountdown, setUndoCountdown] = useState(5);
  const [expenseData, setExpenseData] = useState(null);
  const [expenseStatus, setExpenseStatus] = useState("");
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [groupStatus, setGroupStatus] = useState("");
  const [isAuthed, setIsAuthed] = useState(Boolean(localStorage.getItem("token")));
  const deleteTimeoutRef = useRef(null);
  const deleteCountdownRef = useRef(null);

  useEffect(() => {
    setActiveTab(tabs.includes(defaultTab) ? defaultTab : "road");
  }, [defaultTab]);

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        window.clearTimeout(deleteTimeoutRef.current);
      }
      if (deleteCountdownRef.current) {
        window.clearInterval(deleteCountdownRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "groups") {
      return;
    }

    const fetchGroups = async () => {
      setGroupsLoading(true);
      try {
        const groups = await getMyGroups();
        setGroupList(groups);
      } catch {
        setGroupList([]);
      } finally {
        setGroupsLoading(false);
      }
    };

    fetchGroups();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "expenses" || !isAuthed) {
      return;
    }

    const fetchExpenses = async () => {
      setLoading("expenses-load");
      setError("");

      try {
        const data = await getExpenses(
          groupResult?.groupTrip?._id ? { groupTripId: groupResult.groupTrip._id } : {}
        );
        setExpenseData(data);
      } catch (caughtError) {
        const message =
          caughtError.response?.data?.message ||
          caughtError.message ||
          "Unable to load expenses right now.";
        setError(message);
      } finally {
        setLoading("");
      }
    };

    fetchExpenses();
  }, [activeTab, groupResult?.groupTrip?._id, isAuthed]);

  const runAction = async (key, action) => {
    setError("");
    setLoading(key);
    try {
      await action();
    } catch (caughtError) {
      const status = caughtError.response?.status;
      const message = caughtError.response?.data?.message || caughtError.message || "Something went wrong";

      if (status === 401) {
        setIsAuthed(false);
        setError("Your login session expired. Please login again to use groups and shared expenses.");
      } else {
        setError(message);
      }
    } finally {
      setLoading("");
    }
  };

  const handleRoadSubmit = (event) => {
    event.preventDefault();
    runAction("road", async () => {
      const plan = await createRoadTripPlan({
        ...roadForm,
        budget: Number(roadForm.budget)
      });
      setRoadPlan(plan);
      setActiveTab("road");
    });
  };

  const handleAiSubmit = (event) => {
    event.preventDefault();
    runAction("ai", async () => {
      const result = await generateAiItinerary({
        ...aiForm,
        budget: Number(aiForm.budget),
        duration: Number(aiForm.duration)
      });
      setAiResult(result);
      setActiveTab("ai");
    });
  };

  const handleCreateGroup = () => {
    const normalizedGroupName = String(groupName || "").trim();

    if (!normalizedGroupName) {
      setError("Please enter a group name before creating the group.");
      return;
    }

    setGroupStatus("");

    runAction("groups", async () => {
      const result = await createGroupTrip({
        name: normalizedGroupName,
        destination: aiForm.destination || roadForm.destinationCity,
        itinerary: aiResult?.itinerary || {}
      });
      setGroupResult(result);
      setGroupList((current) => [result.groupTrip, ...current.filter((item) => item._id !== result.groupTrip?._id)]);
      setGroupStatus(`Group created. Invite link: ${result.inviteUrl}`);
    });
  };

  const handleSelectGroup = (groupTrip) => {
    const fallbackInviteUrl = groupTrip?.inviteToken
      ? `${window.location.origin}/groups/join/${groupTrip.inviteToken}`
      : "";

    setGroupResult((current) => ({
      ...current,
      groupTrip,
      inviteUrl: current?.inviteUrl || fallbackInviteUrl
    }));
    setGroupStatus(`Selected group: ${groupTrip.name}`);
  };

  const handleDeleteGroup = (groupTrip) => {
    if (!groupTrip?._id) {
      return;
    }

    if (pendingGroupDeletion) {
      setGroupStatus("One delete is already pending. Undo it or wait for completion.");
      return;
    }

    const previousIndex = groupList.findIndex((item) => item._id === groupTrip._id);
    const wasSelected = groupResult?.groupTrip?._id === groupTrip._id;
    const deletionPayload = {
      groupTrip,
      previousIndex: previousIndex >= 0 ? previousIndex : 0,
      wasSelected
    };

    setGroupList((current) => current.filter((item) => item._id !== groupTrip._id));

    if (wasSelected) {
      setGroupResult(null);
    }

    setPendingGroupDeletion(deletionPayload);
    setUndoCountdown(5);
    setGroupStatus(`Group \"${groupTrip.name}\" scheduled for deletion.`);

    deleteCountdownRef.current = window.setInterval(() => {
      setUndoCountdown((current) => (current > 1 ? current - 1 : 1));
    }, 1000);

    deleteTimeoutRef.current = window.setTimeout(async () => {
      setDeletingGroupId(groupTrip._id);

      try {
        await deleteGroup(groupTrip._id);
        setGroupStatus(`Deleted group: ${groupTrip.name}`);
      } catch (caughtError) {
        const message =
          caughtError.response?.data?.message || caughtError.message || "Failed to delete group.";
        setError(message);
        setGroupStatus(`Could not delete \"${groupTrip.name}\". Restored.`);

        setGroupList((current) => {
          const alreadyPresent = current.some((item) => item._id === groupTrip._id);
          if (alreadyPresent) return current;

          const next = [...current];
          next.splice(Math.min(deletionPayload.previousIndex, next.length), 0, groupTrip);
          return next;
        });

        if (deletionPayload.wasSelected) {
          setGroupResult({
            groupTrip,
            inviteUrl: groupTrip.inviteToken
              ? `${window.location.origin}/groups/join/${groupTrip.inviteToken}`
              : ""
          });
        }
      } finally {
        setDeletingGroupId("");
        setPendingGroupDeletion(null);
        setUndoCountdown(5);

        if (deleteTimeoutRef.current) {
          window.clearTimeout(deleteTimeoutRef.current);
          deleteTimeoutRef.current = null;
        }
        if (deleteCountdownRef.current) {
          window.clearInterval(deleteCountdownRef.current);
          deleteCountdownRef.current = null;
        }
      }
    }, 5000);
  };

  const handleUndoDeleteGroup = () => {
    if (!pendingGroupDeletion) {
      return;
    }

    if (deleteTimeoutRef.current) {
      window.clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }

    if (deleteCountdownRef.current) {
      window.clearInterval(deleteCountdownRef.current);
      deleteCountdownRef.current = null;
    }

    setGroupList((current) => {
      const alreadyPresent = current.some((item) => item._id === pendingGroupDeletion.groupTrip._id);
      if (alreadyPresent) return current;

      const next = [...current];
      next.splice(
        Math.min(pendingGroupDeletion.previousIndex, next.length),
        0,
        pendingGroupDeletion.groupTrip
      );
      return next;
    });

    if (pendingGroupDeletion.wasSelected) {
      setGroupResult({
        groupTrip: pendingGroupDeletion.groupTrip,
        inviteUrl: pendingGroupDeletion.groupTrip.inviteToken
          ? `${window.location.origin}/groups/join/${pendingGroupDeletion.groupTrip.inviteToken}`
          : ""
      });
    }

    setGroupStatus(`Deletion canceled for \"${pendingGroupDeletion.groupTrip.name}\".`);
    setPendingGroupDeletion(null);
    setUndoCountdown(5);
  };

  const handleAddExpense = () => {
    const normalizedTitle = String(expenseForm.title || "").trim();
    const parsedAmount = Number(expenseForm.amount);

    if (!normalizedTitle) {
      setError("Please enter an expense title.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    setExpenseStatus("");
    runAction("expenses", async () => {
      await createExpense({
        title: normalizedTitle,
        amount: parsedAmount,
        category: expenseForm.category,
        groupTripId: groupResult?.groupTrip?._id || null,
        participants: [localStorage.getItem("userId")].filter(Boolean)
      });
      const data = await getExpenses(groupResult?.groupTrip?._id ? { groupTripId: groupResult.groupTrip._id } : {});
      setExpenseData(data);
      setExpenseStatus("Expense added successfully.");
      setExpenseForm((current) => ({ ...current, amount: "", title: "" }));
    });
  };

  const handleEstimate = () => {
    setExpenseStatus("");
    runAction("estimate", async () => {
      const nextEstimates = await estimateExpenses({
        days: Number(aiForm.duration),
        budget: Number(aiForm.budget),
        interests: aiForm.interests
      });
      setEstimates(nextEstimates);
      setExpenseStatus("Daily estimate generated from your AI planner inputs.");
    });
  };

  return (
    <main className="min-h-screen px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8edcff]">TripWise PlanX</p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">{t("title")}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-white/68">{t("subtitle")}</p>
          </div>
        </header>

        {!isAuthed && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-50">
            <span>Guest mode is active. You can try groups here; login to keep them tied to your account.</span>
            <Link className="rounded-md bg-amber-200 px-4 py-2 font-bold text-slate-950" to="/login">
              Login
            </Link>
          </div>
        )}

        <nav className="mt-8 flex gap-2 overflow-x-auto rounded-lg border border-white/15 bg-white/8 p-2">
          {tabs.map((tab) => (
            <Link
              key={tab}
              to={featureRoutes[tab]}
              className={`whitespace-nowrap rounded-md px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] transition ${
                activeTab === tab ? "bg-[#4dd4ff] text-slate-950" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab === "road" && t("roadTrip")}
              {tab === "ai" && t("aiPlanner")}
              {tab === "groups" && t("groups")}
              {tab === "expenses" && t("expenses")}
            </Link>
          ))}
        </nav>

        <div className="mt-6">
          {activeTab === "road" && (
            <RoadTripPlanner
              t={t}
              form={roadForm}
              setForm={setRoadForm}
              plan={roadPlan}
              loading={loading === "road"}
              error={error}
              onSubmit={handleRoadSubmit}
            />
          )}
          {activeTab === "ai" && (
            <AiPlannerPanel
              t={t}
              form={aiForm}
              setForm={setAiForm}
              result={aiResult}
              loading={loading === "ai"}
              error={error}
              onSubmit={handleAiSubmit}
            />
          )}
          {activeTab === "groups" && (
            <CollaborationPanel
              t={t}
              groupName={groupName}
              setGroupName={setGroupName}
              groupResult={groupResult}
              onCreateGroup={handleCreateGroup}
              loading={loading === "groups"}
              error={activeTab === "groups" ? error : ""}
              isAuthed={isAuthed}
              status={groupStatus}
              groups={groupList}
              groupsLoading={groupsLoading}
              onSelectGroup={handleSelectGroup}
              onDeleteGroup={handleDeleteGroup}
              deletingGroupId={deletingGroupId}
              hasPendingDeletion={Boolean(pendingGroupDeletion)}
            />
          )}
          {activeTab === "expenses" && (
            <ExpenseDashboard
              t={t}
              expenseForm={expenseForm}
              setExpenseForm={setExpenseForm}
              expenseData={expenseData}
              estimates={estimates}
              onAddExpense={handleAddExpense}
              onEstimate={handleEstimate}
              loading={loading === "expenses" || loading === "expenses-load" || loading === "estimate"}
              error={activeTab === "expenses" ? error : ""}
              isAuthed={isAuthed}
              status={expenseStatus}
            />
          )}
        </div>
      </div>

      {pendingGroupDeletion && (
        <div className="fixed bottom-6 left-1/2 z-[160] w-[min(92vw,640px)] -translate-x-1/2 rounded-2xl border border-[#4dd4ff]/40 bg-[rgba(7,29,34,0.95)] px-4 py-3 shadow-[0_24px_70px_rgba(2,16,22,0.35)] backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-cyan-50">
              Group "{pendingGroupDeletion.groupTrip.name}" will be deleted in {undoCountdown}s.
            </p>
            <button
              type="button"
              onClick={handleUndoDeleteGroup}
              className="rounded-md bg-[#4dd4ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-950 hover:bg-[#82e3ff]"
            >
              Undo
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdvancedTripPlanner;
