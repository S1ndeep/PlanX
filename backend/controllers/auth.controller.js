import bcrypt from "bcrypt";
import axios from "axios";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../services/email.service.js";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_RESET_EXPIRY_MINUTES = 20;

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

const generatePasswordResetToken = () => crypto.randomBytes(32).toString("hex");

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  profilePicture: user.profilePicture || null
});

const validatePassword = (password = "") => password.length >= PASSWORD_MIN_LENGTH;

const getPasswordStrengthLabel = (password = "") => {
  let score = 0;

  if (password.length >= PASSWORD_MIN_LENGTH) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return "weak";
  if (score <= 3) return "medium";
  return "strong";
};

const getPasswordValidationMessage = (password = "") => {
  if (!validatePassword(password)) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
  }

  if (getPasswordStrengthLabel(password) === "weak") {
    return "Password must include a mix of uppercase, lowercase, number, or symbol";
  }

  return "";
};

const getResetPasswordBaseUrl = () => {
  const explicitBaseUrl =
    process.env.PASSWORD_RESET_URL_BASE?.trim() ||
    process.env.FRONTEND_RESET_URL?.trim() ||
    process.env.FRONTEND_URL?.split(",")[0]?.trim() ||
    "http://localhost:5173";

  return explicitBaseUrl.replace(/\/+$/, "");
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const passwordValidationMessage = getPasswordValidationMessage(password);
    if (passwordValidationMessage) {
      return res.status(400).json({ message: passwordValidationMessage });
    }

    const normalizedEmail = normalizeEmail(email);
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Signup failed", error);
    return res.status(500).json({ message: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google sign-in. Continue with Google to access it." });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    return res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Login failed", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken, accessToken } = req.body;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      return res.status(500).json({ message: "Google sign-in is not configured on the server" });
    }

    const googleClient = new OAuth2Client(googleClientId);
    let payload;

    if (idToken) {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: googleClientId
      });

      payload = ticket.getPayload();
    } else if (accessToken) {
      const tokenInfo = await googleClient.getTokenInfo(accessToken);

      if (!tokenInfo.aud || tokenInfo.aud !== googleClientId) {
        return res.status(401).json({ message: "Google token audience did not match this application" });
      }

      const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      payload = userInfoResponse.data;
    } else {
      return res.status(400).json({ message: "Google ID token or access token is required" });
    }

    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ message: "Google account email could not be verified" });
    }

    const normalizedEmail = normalizeEmail(payload.email);
    let user = await User.findOne({
      $or: [
        { googleId: payload.sub },
        { email: normalizedEmail }
      ]
    });

    if (user) {
      user.name = payload.name?.trim() || user.name;
      user.email = normalizedEmail;
      user.googleId = payload.sub;
      user.profilePicture = payload.picture || user.profilePicture || null;
      await user.save();
    } else {
      user = await User.create({
        name: payload.name?.trim() || "Google User",
        email: normalizedEmail,
        googleId: payload.sub,
        profilePicture: payload.picture || null
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Google auth failed", error);
    return res.status(401).json({ message: "Google authentication failed" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !normalizeEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (user && user.password) {
      const rawToken = generatePasswordResetToken();
      const hashedToken = hashResetToken(rawToken);
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpiresAt = expiresAt;
      await user.save();

      const resetUrl = `${getResetPasswordBaseUrl()}/reset-password/${rawToken}`;
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl
      });
    }

    return res.status(200).json({
      message: "Password reset link sent to your email"
    });
  } catch (error) {
    console.error("Forgot password failed", error);
    return res.status(500).json({ message: "Unable to process your request right now" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const passwordValidationMessage = getPasswordValidationMessage(newPassword);
    if (passwordValidationMessage) {
      return res.status(400).json({
        message: passwordValidationMessage,
        passwordStrength: getPasswordStrengthLabel(newPassword)
      });
    }

    const hashedToken = hashResetToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.status(200).json({
      message: "Password reset successful"
    });
  } catch (error) {
    console.error("Reset password failed", error);
    return res.status(500).json({ message: "Unable to reset password right now" });
  }
};
