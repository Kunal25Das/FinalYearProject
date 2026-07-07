import nodemailer from "nodemailer";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_EMAIL_PASS = process.env.ADMIN_EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ADMIN_EMAIL,
    pass: ADMIN_EMAIL_PASS,
  },
});

/**
 * Sends a password reset OTP email
 */
export async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: `"UniVerse Platform" <${ADMIN_EMAIL}>`,
    to: email,
    subject: "UniVerse Password Reset OTP",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg">
        <h2 style="color: #6b46c1; text-align: center;">UniVerse Reset Password OTP</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Use the OTP code below to proceed with your password reset:</p>
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0; color: #4a5568; border: 1px dashed #cbd5e0;">
          ${otp}
        </div>
        <p style="color: #718096; font-size: 14px;">This OTP is valid for 10 minutes. If you did not make this request, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="text-align: center; color: #a0aec0; font-size: 12px;">© ${new Date().getFullYear()} UniVerse. All rights reserved.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Sends one-time credentials to a newly created user (dept-admin, faculty, student, etc.)
 */
export async function sendOneTimePasswordEmail({
  email,
  name,
  role,
  tempPassword,
}) {
  const loginUrl = `${process.env.APP_URL_DEV || "http://localhost:3000"}/auth/login`;

  const mailOptions = {
    from: `"UniVerse Platform" <${ADMIN_EMAIL}>`,
    to: email,
    subject: "Welcome to UniVerse - Account Created",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg">
        <h2 style="color: #6b46c1; text-align: center;">Welcome to UniVerse!</h2>
        <p>Hello ${name},</p>
        <p>Your college administrator has created an account for you as a <strong>${role}</strong> on the UniVerse platform.</p>
        <p>Here are your temporary login credentials:</p>
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <p style="margin: 5px 0;"><strong>Login Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>One-Time Password:</strong> <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${tempPassword}</code></p>
        </div>
        <p><strong>Note:</strong> You will be required to update this temporary password upon your very first login to secure your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #6b46c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">Log In to UniVerse</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="text-align: center; color: #a0aec0; font-size: 12px;">© ${new Date().getFullYear()} UniVerse. All rights reserved.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Sends approval notification to a college admin
 */
export async function sendApprovalEmail(email, adminName, instituteName) {
  const loginUrl = `${process.env.APP_URL_DEV || "http://localhost:3000"}/auth/login`;

  const mailOptions = {
    from: `"UniVerse Platform" <${ADMIN_EMAIL}>`,
    to: email,
    subject: "UniVerse Institute Registration Approved!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg">
        <h2 style="color: #2f855a; text-align: center;">Institute Request Approved 🎉</h2>
        <p>Hello ${adminName},</p>
        <p>We are excited to inform you that your registration request for <strong>${instituteName}</strong> has been approved by the UniVerse Super Admin!</p>
        <p>Your college-admin account is now active. You can log in and start configuring your departments, batches, HODs, faculty, and students.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #2f855a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">Get Started</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="text-align: center; color: #a0aec0; font-size: 12px;">© ${new Date().getFullYear()} UniVerse. All rights reserved.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Sends a custom broadcast email to a recipient list
 */
export async function sendCustomEmail({ to, subject, body }) {
  const mailOptions = {
    from: `"UniVerse Platform" <${ADMIN_EMAIL}>`,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px">
        <h2 style="color: #6b46c1; text-align: center;">UniVerse Notification</h2>
        <div style="font-size: 15px; color: #313b4e; line-height: 1.6; white-space: pre-line;">
          ${body}
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="text-align: center; color: #a0aec0; font-size: 12px;">© ${new Date().getFullYear()} UniVerse. All rights reserved.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
