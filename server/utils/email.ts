import { Resend } from "resend";

// Safely initialize Resend only if the API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
export async function sendVerificationEmail(to: string, otp: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "[Email] RESEND_API_KEY not configured. In a real environment, an email would be sent to",
      to,
      "with OTP",
      otp
    );
    // Return true in development to allow testing without email setup
    return process.env.NODE_ENV !== "production";
  }

  const htmlContent = `
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
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Murshid Academic Advisor <info@murshidjo.com>",
      to: [to],
      subject: "Verify your university email",
      html: htmlContent,
    });

    if (error) {
      console.error("[Email] Resend API Error:", error);
      return false;
    }

    console.log("[Email] Successfully sent via Resend:", data);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send verification email:", error);
    return false;
  }
}
