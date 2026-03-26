import { processChatMessage } from "../services/chat.service.js";

export const chatWithAssistant = async (req, res) => {
  try {
    const { message, tripContext = null } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "message is required and must be a non-empty string"
      });
    }

    const result = await processChatMessage(message.trim(), tripContext);
    return res.json(result);
  } catch (error) {
    console.error("Chat API error", {
      message: error.message,
      status: error.response?.status || "no_response",
      details: error.response?.data || null
    });

    return res.status(500).json({
      message: "Failed to process chat message",
      details: error.response?.data || error.message
    });
  }
};
