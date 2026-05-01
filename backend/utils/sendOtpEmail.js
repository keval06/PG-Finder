const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // App Password, not real password
  },
});

exports.sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"QuickPG" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your QuickPG Password Reset OTP",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: auto; background: #ffffff; border: 1px solid #DDDDDD; border-radius: 16px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: #FF385C; padding: 32px 40px; text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: rgba(255,255,255,0.15); border-radius: 12px; margin-bottom: 12px;">
            <span style="font-size: 24px;">🏠</span>
          </div>
          <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600; letter-spacing: -0.3px;">QuickPG</h1>
          <p style="margin: 4px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">Find your perfect PG, instantly</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px;">
          <h2 style="margin: 0 0 8px; color: #222222; font-size: 20px; font-weight: 600;">Password Reset Request</h2>
          <p style="margin: 0 0 32px; color: #717171; font-size: 15px; line-height: 1.6;">
            We received a request to reset your QuickPG password. Use the OTP below to continue. It expires in <strong style="color: #222222;">10 minutes</strong>.
          </p>

          <!-- OTP Box -->
          <div style="background: #fff5f7; border: 1.5px solid #FF385C; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <p style="margin: 0 0 8px; color: #717171; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Your One-Time Password</p>
            <div style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #FF385C; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>

          <!-- Warning -->
          <div style="background: #f8fafc; border-radius: 10px; padding: 16px; margin-bottom: 32px;">
            <p style="margin: 0; color: #484848; font-size: 13px; line-height: 1.6;">
              🔒 <strong>Security notice:</strong> This OTP can only be used once. If you didn't request a password reset, please ignore this email — your account remains secure.
            </p>
          </div>

          <p style="margin: 0; color: #717171; font-size: 13px; line-height: 1.6;">
            Need help? Reply to this email or visit 
            <a href="https://quickpg.in" style="color: #FF385C; text-decoration: none; font-weight: 500;">quickpg.in</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #DDDDDD; padding: 20px 40px; text-align: center;">
          <p style="margin: 0; color: #717171; font-size: 12px;">
            © 2026 Quick PG · 
            <a href="https://quickpg.in" style="color: #717171; text-decoration: none;">quickpg.in</a>
          </p>
        </div>

      </div>
    `,
  });
};
