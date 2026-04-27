import nodemailer from "nodemailer";

const DEFAULT_SMTP_PORT = 587;

const parseBoolean = (value = "") => value.trim().toLowerCase() === "true";

const createTransport = () => {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || DEFAULT_SMTP_PORT),
    secure: parseBoolean(process.env.SMTP_SECURE || "false"),
    auth: {
      user,
      pass
    }
  });
};

export const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  const transport = createTransport();
  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || "no-reply@tripwise.local";
  const safeName = name?.trim() || "traveler";

  if (!transport) {
    console.info(`Password reset link for ${email}: ${resetUrl}`);
    return { delivered: false, previewUrl: resetUrl };
  }

  await transport.sendMail({
    from,
    to: email,
    subject: "Reset your TripWise password",
    text: [
      `Hi ${safeName},`,
      "",
      "We received a request to reset your TripWise password.",
      `Reset your password here: ${resetUrl}`,
      "",
      "This link expires in 20 minutes. If you did not request this, you can ignore this email."
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <p>Hi ${safeName},</p>
        <p>We received a request to reset your TripWise password.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#14b8a6;color:#ffffff;text-decoration:none;font-weight:700">
            Reset Password
          </a>
        </p>
        <p>This link expires in 20 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `
  });

  return { delivered: true };
};
