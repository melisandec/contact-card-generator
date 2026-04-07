import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? 'CardCrafter <notifications@cardcrafter.app>';

export interface ScanNotificationData {
  ownerEmail: string;
  ownerName: string;
  profileName: string;
  profileSlug: string;
  profileUrl: string;
  action: string; // 'view' | 'save_contact' | 'email' | 'call' | 'social_click'
}

export async function sendScanNotification(data: ScanNotificationData): Promise<void> {
  const actionLabels: Record<string, string> = {
    view: 'viewed your card',
    save_contact: 'saved your contact',
    email: 'tapped your email',
    call: 'tapped your phone number',
    social_click: 'clicked a social link',
  };

  const actionLabel = actionLabels[data.action] ?? 'interacted with your card';
  const subject = `Someone ${actionLabel} — ${data.profileName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:8px;">
                      <div style="width:28px;height:28px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;">
                        <span style="color:#fff;font-size:14px;">⬡</span>
                      </div>
                      <span style="color:#fff;font-size:15px;font-weight:600;letter-spacing:-0.3px;">CardCrafter</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:0.8px;">Card Activity</p>
              <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">
                Someone ${actionLabel} 👀
              </h1>

              <!-- Card badge -->
              <div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:0.6px;">Your card</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#1e293b;">${data.profileName}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#6366f1;">cardcrafter.app/p/${data.profileSlug}</p>
              </div>

              <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
                Your digital card is getting traction! View your analytics to see the full picture.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background:#6366f1;">
                    <a href="${data.profileUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">
                      View your card →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                You're receiving this because scan notifications are enabled for <strong>${data.profileName}</strong>.
                You can turn them off anytime in your CardCrafter profile settings.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  if (!resend) {
    // No API key configured — log instead of crashing
    console.log(`[email] Would send scan notification to ${data.ownerEmail}: ${subject}`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: data.ownerEmail,
      subject,
      html,
    });
  } catch (err) {
    // Fire-and-forget — never let email errors crash the page
    console.error('[email] Failed to send scan notification:', err);
  }
}
