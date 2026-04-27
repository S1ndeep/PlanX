

export const generateItinerary = async (req, res) => {
  try {
    const { destination, days = 3, budget = 1000, interests = ["sightseeing"] } = req.body;
    if (!destination || !days || !budget) {
      return res.status(400).json({ message: "destination, days, and budget are required" });
    }
    const itinerary = [];
    for (let i = 1; i <= days; i++) {
      itinerary.push({
        day: i,
        morning: `Explore a top attraction in ${destination} (${interests[0]})`,
        afternoon: `Enjoy a local meal and visit a cultural site`,
        evening: `Relax at a scenic spot or try a local activity`,
        places: [
          `Famous place ${i} in ${destination}`,
          `Popular restaurant ${i}`,
          `Evening spot ${i}`
        ]
      });
    }
    return res.json({ itinerary });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate itinerary", error: error.message });
  }
};
