const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY,
  }
});

exports.sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"QuickPG" <noreply@quickpg.in>`,
    to: email,
    subject: "Your QuickPG Password Reset OTP",
    html: `
 <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: auto; background: #ffffff; border: 1px solid #DDDDDD; border-radius: 16px; overflow: hidden;">

  <!-- HEADER -->

  <div style="background: #FF385C; padding: 32px 40px; text-align: center;">

<!-- LOGO (UNCHANGED, wrapped for correct visibility) -->
<div style="display: inline-flex; align-items: center; gap: 10px; background: #ffffff; padding: 10px 14px; border-radius: 12px; margin-bottom: 12px;">
  
  <svg width="44" height="44" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="68" height="68" rx="14" fill="none" stroke="#222222" stroke-width="5"/>
    <rect x="20" y="20" width="18" height="18" rx="3" fill="#F5F5F5"/>
    <rect x="42" y="20" width="18" height="18" rx="3" fill="#F5F5F5"/>
    <rect x="20" y="42" width="18" height="18" rx="3" fill="#FF385C"/>
    <rect x="42" y="42" width="18" height="18" rx="3" fill="#F5F5F5"/>
  </svg>

  <span style="font-size: 26px; font-weight: 700; letter-spacing: -0.5px; color: #222222;">
    Quick<span style="color: #FF385C;">PG</span>
  </span>
</div>

<p style="margin: 0; color: rgba(255,255,255,0.85); font-size: 13px;">
  Find your perfect PG, instantly
</p>

  </div>

  <!-- BODY -->

  <div style="padding: 40px;">
    <h2 style="margin: 0 0 8px; color: #222222; font-size: 20px; font-weight: 600;">
      Password Reset Request
    </h2>

<p style="margin: 0 0 32px; color: #717171; font-size: 15px; line-height: 1.6;">
  We received a request to reset your QuickPG password.
  Use the OTP below to continue. It expires in 
  <strong style="color: #222222;">10 minutes</strong>.
</p>

<!-- OTP BOX -->
<div style="background: #fff5f7; border: 1.5px solid #FF385C; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
  <p style="margin: 0 0 8px; color: #717171; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
    Your One-Time Password
  </p>

  <div style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #FF385C; font-family: 'Courier New', monospace;">
    ${otp}
  </div>
</div>

<!-- SECURITY NOTE -->
<div style="background: #f8fafc; border-radius: 10px; padding: 16px; margin-bottom: 32px;">
  <p style="margin: 0; color: #484848; font-size: 13px; line-height: 1.6;">
    🔒 <strong>Security notice:</strong> This OTP can only be used once.
    If you didn't request a password reset, please ignore this email — your account remains secure.
  </p>
</div>

<p style="margin: 0; color: #717171; font-size: 13px; line-height: 1.6;">
  Need help? Reply to this email or visit 
  <a href="https://quickpg.in" style="color: #FF385C; text-decoration: none; font-weight: 500;">
    quickpg.in
  </a>
</p>

  </div>

  <!-- FOOTER -->

  <div style="border-top: 1px solid #DDDDDD; padding: 20px 40px; text-align: center;">
    <p style="margin: 0; color: #717171; font-size: 12px;">
      © 2026 Quick PG · 
      <a href="https://quickpg.in" style="color: #717171; text-decoration: none;">
        quickpg.in
      </a>
    </p>
  </div>

</div>

 `,
  });
};
