export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const persistAuthSession = ({ token, user }) => {
  localStorage.setItem("token", token);
  localStorage.setItem("userName", user.name);
  localStorage.setItem("userId", user.id);

  if (user.profilePicture) {
    localStorage.setItem("userProfilePicture", user.profilePicture);
  } else {
    localStorage.removeItem("userProfilePicture");
  }

  window.dispatchEvent(new Event("tripwise-auth-changed"));
};
