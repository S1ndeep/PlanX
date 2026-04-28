import axios from "axios";
const configuredApiUrl =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const normalizedApiBase = configuredApiUrl.endsWith("/api")
  ? configuredApiUrl
  : `${configuredApiUrl.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL: normalizedApiBase
});

const getGuestId = () => {
  const existing = localStorage.getItem("tripwiseGuestId");
  if (existing) return existing;

  const bytes = new Uint8Array(12);
  window.crypto.getRandomValues(bytes);
  const guestId = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  localStorage.setItem("tripwiseGuestId", guestId);
  return guestId;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["X-TripWise-Guest-Id"] = getGuestId();

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userProfilePicture");
      window.dispatchEvent(new Event("tripwise-auth-changed"));
    }

    return Promise.reject(error);
  }
);

export const createRoadTripPlan = (payload) =>
  api.post("/road-trips", payload).then((response) => response.data.plan);

export const generateAiItinerary = (payload) =>
  api.post("/ai/itinerary", payload).then((response) => response.data);

export const createGroupTrip = (payload) =>
  api.post("/groups", payload).then((response) => {
    if (response.data.guestId) {
      localStorage.setItem("tripwiseGuestId", response.data.guestId);
    }

    return response.data;
  });

export const getMyGroups = () =>
  api.get("/groups").then((response) => response.data.groups || []);

export const joinGroupByInvite = (token) =>
  api.post(`/groups/join/${token}`).then((response) => response.data.groupTrip);

export const getGroupById = (groupId) =>
  api.get(`/groups/${groupId}`).then((response) => response.data.groupTrip);

export const deleteGroup = (groupId) =>
  api.delete(`/groups/${groupId}`).then((response) => response.data);

export const createExpense = (payload) =>
  api.post("/expenses", payload).then((response) => response.data.expense);

export const getExpenses = (params = {}) =>
  api.get("/expenses", { params }).then((response) => response.data);

export const estimateExpenses = (payload) =>
  api.post("/expenses/estimate", payload).then((response) => response.data.estimates);

export const getRecommendations = () =>
  api.get("/ai/recommendations").then((response) => response.data.recommendations);
