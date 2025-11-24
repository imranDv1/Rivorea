import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import EmailVerification from "@/components/verify-email-template";

interface SendVerificationEmailParams {
  to: string;
  username: string;
  verifyUrl: string;
}

// Create reusable transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

export async function sendVerificationEmail({
  to,
  username,
  verifyUrl,
}: SendVerificationEmailParams) {
  try {
    const transporter = createTransporter();

    // Render the React email template to HTML
    const emailHtml = await render(
      EmailVerification({
        username,
        verifyUrl,
      })
    );

    // Send email
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: "Verify Your Email Address - Rivorea",
      html: emailHtml,
      text: `Hi ${username},\n\nThank you for signing up! Please verify your email address by clicking this link: ${verifyUrl}\n\nThis verification link will expire in 24 hours for your security.\n\nIf you didn't create an account with us, please ignore this email.`,
    });

    console.log("Verification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

