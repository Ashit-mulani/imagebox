import dotenv from 'dotenv';
import { Resend } from 'resend';
import { apiError } from '../utils/apiError.js';

dotenv.config();

const resend = new Resend(process.env.RESEND);

export const sendOTP = async (to, otp, userName) => {
  const fromAddress = `Imagebox <onboarding@resend.dev>`;
  const subject = 'Your ImageBox Verification Code';
  const body = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 40px 20px;">
        <div style="max-width: 600px; background: #fff; margin: auto; border-radius: 10px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #333;">Hello <span style="color: #007BFF;">${userName}</span>,</h2>
          <p style="font-size: 16px; color: #555; margin: 20px 0;">
            Thank you for signing up with <strong>ImageStore</strong>! To complete your registration, please use the OTP code below to verify your email address:
          </p>
          <div style="margin: 30px 0; background: #e9f7fe; padding: 20px; text-align: center; border-radius: 8px;">
            <span style="font-size: 28px; color: #007BFF; font-weight: bold; letter-spacing: 2px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666;">
            ⚠️ This OTP is valid for <strong>5 minutes</strong>. If you did not request this code, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 14px; color: #888;">
            Regards,<br>
            <strong>ImageStore Team</strong><br>
          </p>
        </div>
      </div>
    `;

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: subject,
      html: body,
    });
    if (!data) {
      throw new apiError(500, 'Failed to send email, try later');
    }
  } catch (err) {
    console.log(err);

    throw new apiError(500, err?.message || 'Failed to send email with resend');
  }
};

export const sendResetPassOtp = async (to, otp, userName) => {
  const fromAddress = `Imagebox <onboarding@resend.dev>`;

  const subject = 'Your ImageBox Verification Code';

  const body = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 40px 20px;">
        <div style="max-width: 600px; background: #fff; margin: auto; border-radius: 10px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #333;">Hello <span style="color: #007BFF;">${userName}</span>,</h2>
          <p style="font-size: 16px; color: #555; margin: 20px 0;">
            We received a request to reset your password for your <strong>ImageStore</strong> account. Please use the OTP code below to proceed with resetting your password:
          </p>
          <div style="margin: 30px 0; background: #e9f7fe; padding: 20px; text-align: center; border-radius: 8px;">
            <span style="font-size: 28px; color: #007BFF; font-weight: bold; letter-spacing: 2px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666;">
            ⚠️ This OTP is valid for <strong>5 minutes</strong>. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 14px; color: #888;">
            Regards,<br>
            <strong>ImageStore Team</strong><br>
          </p>
        </div>
      </div>
    `;

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: subject,
      html: body,
    });
    if (!data) {
      throw new apiError(500, 'Failed to send email, try later');
    }
  } catch (err) {
    throw new apiError(500, err?.message || 'Failed to send email with resend');
  }
};
