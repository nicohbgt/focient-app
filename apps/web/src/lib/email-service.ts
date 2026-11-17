/**
 * FoCient Email Service (Web Application Engine)
 *
 * Dispatches transactional verification OTP emails with multi-provider support:
 * 1. Resend API (via REST fetch - https://resend.com)
 * 2. Brevo / Sendinblue (via REST fetch - https://brevo.com)
 * 3. SendGrid (via REST fetch)
 * 4. Development / Sandbox fallback with real-time console delivery
 */

export interface EmailDispatchResult {
  success: boolean;
  delivered: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

function getEmailHtml(code: string, email: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode Verifikasi FoCient</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 480px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; padding: 36px 28px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #0F172A; letter-spacing: -0.02em;">
                Verifikasi Email Anda
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748B; line-height: 1.5;">
                Gunakan kode OTP berikut untuk menyelesaikan pendaftaran akun FoCient Anda untuk <strong>${email}</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 12px 0 28px 0;">
              <div style="display: inline-block; background-color: #EFF6FF; border: 2px dashed #93C5FD; border-radius: 14px; padding: 16px 36px;">
                <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #2563EB;">
                  ${code}
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #F1F5F9; padding-top: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748B; line-height: 1.5;">
                • Kode ini berlaku selama <strong>10 menit</strong>.<br>
                • Jangan bagikan kode ini kepada siapa pun untuk keamanan akun Anda.<br>
                • Jika Anda tidak meminta kode ini, Anda dapat mengabaikan email ini.
              </p>
              <p style="margin: 20px 0 0 0; font-size: 12px; color: #94A3B8; text-align: center;">
                FoCient — Intelligent Focus Management & Guilt-Free Adaptive Rescheduling
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getEmailText(code: string, email: string): string {
  return `Halo!\n\nKode verifikasi akun FoCient Anda untuk ${email} adalah:\n\n${code}\n\nKode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.\n\nSalam hangat,\nTim FoCient`;
}

/**
 * Dispatch verification OTP to real email inbox or developer console
 */
export async function sendOtpEmail(email: string, code: string, purpose: 'registration' | 'password_reset' = 'registration'): Promise<EmailDispatchResult> {
  const cleanEmail = email.trim().toLowerCase();
  const subject = purpose === 'registration'
    ? `Kode Verifikasi FoCient: ${code}`
    : `Kode Pemulihan Kata Sandi FoCient: ${code}`;
  const htmlContent = getEmailHtml(code, cleanEmail);
  const textContent = getEmailText(code, cleanEmail);

  // 1. Provider: Resend (https://resend.com)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || 'FoCient <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [cleanEmail],
          subject,
          html: htmlContent,
          text: textContent,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        console.log(`[EmailService] Berhasil terkirim via Resend ke ${cleanEmail}. MessageId: ${data.id}`);
        return { success: true, delivered: true, provider: 'resend', messageId: data.id };
      } else {
        const errorText = await res.text();
        console.warn(`[EmailService] Resend API error (${res.status}):`, errorText);
      }
    } catch (err) {
      console.warn('[EmailService] Resend dispatch failed:', err);
    }
  }

  // 2. Provider: Brevo / Sendinblue (https://brevo.com)
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const senderEmail = process.env.EMAIL_FROM_ADDRESS || 'noreply@focient.dev';
      const senderName = process.env.EMAIL_FROM_NAME || 'FoCient';
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: cleanEmail }],
          subject,
          htmlContent,
          textContent,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { messageId?: string };
        console.log(`[EmailService] Berhasil terkirim via Brevo ke ${cleanEmail}. MessageId: ${data.messageId}`);
        return { success: true, delivered: true, provider: 'brevo', messageId: data.messageId };
      } else {
        const errorText = await res.text();
        console.warn(`[EmailService] Brevo API error (${res.status}):`, errorText);
      }
    } catch (err) {
      console.warn('[EmailService] Brevo dispatch failed:', err);
    }
  }

  // 3. Provider: Generic Webhook / Relay
  const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cleanEmail,
          code,
          purpose,
          subject,
          html: htmlContent,
          text: textContent,
        }),
      });
      if (res.ok) {
        return { success: true, delivered: true, provider: 'webhook' };
      }
    } catch (err) {
      console.warn('[EmailService] Webhook dispatch failed:', err);
    }
  }

  // 4. Development / Sandbox Console Output
  console.log('\n========================================================================');
  console.log(' [FoCient OTP Real-Time Delivery]');
  console.log(` Email Tujuan  : ${cleanEmail}`);
  console.log(` Kode OTP      : ${code}`);
  console.log(' Info          : Belum ada RESEND_API_KEY atau BREVO_API_KEY di file .env.');
  console.log('                 Untuk mengirim email sungguhan ke inbox Gmail, tambahkan:');
  console.log('                 RESEND_API_KEY=re_xxxx... di file .env');
  console.log('========================================================================\n');

  return {
    success: true,
    delivered: false,
    provider: 'sandbox',
  };
}
