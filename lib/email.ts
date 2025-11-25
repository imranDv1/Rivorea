import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import EmailVerification from "@/components/verify-email-template";
import ForgotPasswordEmail from "@/components/forgetPassword-template";

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
      from: `Rivorea <${process.env.GMAIL_USER}>`,
      to,
      subject: "Verify Your Email Address - Rivorea",
      html: emailHtml,
      text: `Hello ${username},\n\nThank you for signing up for Rivorea! We're thrilled to have you join our community.\n\nTo complete your registration and secure your account, please verify your email address by clicking this link:\n\n${verifyUrl}\n\nThis verification link will expire in 24 hours.\n\nIf you didn't create an account with Rivorea, please ignore this email. Your email address will not be added to our system.\n\nNeed help? Contact us at support@rivorea.com\n\n© ${new Date().getFullYear()} Rivorea. All rights reserved.`,
    });

    console.log("Verification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}


interface SendResetPassEmailParams {
  to: string;
  username: string;
  resetUrl: string;
}

export async function sendResetPasswordEmail({
  to,
  username,
  resetUrl,
}: SendResetPassEmailParams) {
  try {
    const transporter = createTransporter();

    // Render the React email template to HTML
    const emailHtml = await render(
      ForgotPasswordEmail({
        username,
        resetUrl,
        to
      })
    );

    // Send email
    const info = await transporter.sendMail({
      from: `Rivorea <${process.env.GMAIL_USER}>`,
      to,
      subject: "Reset Your Password - Rivorea",
      html: emailHtml,
      text: `Hello ${username},\n\nWe received a request to reset the password for your Rivorea account associated with ${to}.\n\nClick the link below to create a new password. This link will expire in 24 hours for security reasons:\n\n${resetUrl}\n\nIf you didn't request this password reset, please ignore this email. Your password will remain unchanged.\n\n© ${new Date().getFullYear()} Rivorea. All rights reserved.`,
    });

    console.log("reset password email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}
