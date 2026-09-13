import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "MASHUDI Admin <noreply@mashudi.local>";

let transporter: any = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export async function sendResetPasswordEmail(email: string, resetUrl: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transport = getTransporter();
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">MASHUDI TRANSPORT</h1>
    <p style="color: #fecaca; margin: 8px 0 0; font-size: 14px;">Sewa Mobil Pekanbaru</p>
  </div>
  <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 0 0 12px 12px; padding: 30px;">
    <h2 style="color: #991b1b; margin: 0 0 16px; font-size: 20px;">Reset Password Admin</h2>
    <p style="margin: 0 0 16px;">Halo,</p>
    <p style="margin: 0 0 16px;">Kamu (atau orang lain) meminta reset password untuk akun admin MASHUDI.</p>
    <div style="background: white; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Klik tombol di bawah (berlaku 1 jam, 1x pakai):</p>
      <a href="${resetUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Reset Password</a>
    </div>
    <p style="margin: 16px 0 0; font-size: 13px; color: #6b7280;">Link alternatif (copy paste ke browser):</p>
    <p style="margin: 8px 0 0; font-size: 12px; color: #991b1b; word-break: break-all; background: #fef2f2; padding: 12px; border-radius: 6px;">${resetUrl}</p>
    <hr style="border: none; border-top: 1px solid #fecaca; margin: 24px 0;">
    <p style="margin: 0; font-size: 12px; color: #991b1b;">Kalau bukan kamu yang minta, abaikan email ini. Password kamu tetep aman.</p>
    <p style="margin: 16px 0 0; font-size: 12px; color: #991b1b;">— Tim MASHUDI TRANSPORT</p>
  </div>
  <p style="text-align: center; margin: 16px 0 0; font-size: 11px; color: #9ca3af;">Jl. Kurnia No.4, Tengkerang Labuai, Bukit Raya, Kota Pekanbaru, Riau 28289</p>
</body>
</html>
  `.trim();

  const text = `
MASHUDI TRANSPORT - Reset Password Admin

Halo,

Kamu (atau orang lain) meminta reset password untuk akun admin MASHUDI.

Link reset (berlaku 1 jam, 1x pakai):
${resetUrl}

Kalau bukan kamu, abaikan email ini. Password kamu tetep aman.

— Tim MASHUDI TRANSPORT
Jl. Kurnia No.4, Tengkerang Labuai, Bukit Raya, Kota Pekanbaru, Riau 28289
  `.trim();

  try {
    if (!SMTP_USER || !SMTP_PASS) {
      // Fallback: log ke console untuk dev
      console.log("=== EMAIL RESET PASSWORD (DEV MODE - NO SMTP) ===");
      console.log(`To: ${email}`);
      console.log(`Subject: Reset Password MASHUDI Admin`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log("=== END EMAIL ===");
      return { success: true, messageId: "dev-mode-logged" };
    }

    const info = await transport.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: "Reset Password MASHUDI Admin",
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Email send error:", error);
    // Fallback log
    console.log("=== EMAIL RESET PASSWORD (FALLBACK LOG) ===");
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("=== END EMAIL ===");
    return { success: false, error: error.message };
  }
}

export async function verifySmtpConnection(): Promise<boolean> {
  if (!SMTP_USER || !SMTP_PASS) return false;
  try {
    const transport = getTransporter();
    await transport.verify();
    return true;
  } catch {
    return false;
  }
}