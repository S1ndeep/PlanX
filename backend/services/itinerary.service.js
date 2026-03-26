import { buildSmartMultiDayItinerary } from "./planner.service.js";

export const buildItinerary = ({ days, places }) =>
  buildSmartMultiDayItinerary({
    days,
    places
  }).itinerary;
