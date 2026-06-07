import nodemailer from "nodemailer";

// Using standard SMTP configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, otp: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(
      "[Email] SMTP credentials not configured. In a real environment, an email would be sent to",
      to,
      "with OTP",
      otp
    );
    // Return true in development to allow testing without email setup
    return process.env.NODE_ENV !== "production";
  }

  const mailOptions = {
    from: `"Murshid Academic Advisor" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify your university email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #004b87; text-align: center;">Murshid Academic Advisor</h2>
        <p>Hello!</p>
        <p>Thank you for registering. To complete your account setup and verify that you own this university email address, please use the following 6-digit verification code:</p>
        <div style="background-color: #f4f7f6; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 12px; color: #888; text-align: center;">Al-Zaytoonah University of Jordan - Murshid Platform</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send verification email:", error);
    return false;
  }
}
