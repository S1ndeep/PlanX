export class HttpError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const sendControllerError = (res, error, fallbackMessage = "Request failed") => {
  const statusCode = error.statusCode || error.response?.status || 500;

  if (statusCode >= 500) {
    console.error(fallbackMessage, {
      message: error.message,
      status: error.response?.status || "no_response",
      details: error.response?.data || error.details || null
    });
  }

  return res.status(statusCode).json({
    message: error.statusCode ? error.message : fallbackMessage,
    details: error.details || error.response?.data || error.message
  });
};
