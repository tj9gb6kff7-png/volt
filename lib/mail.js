'use strict';

/** Sends the sign-in link through Resend. Throws if the email could not be sent. */
async function sendLoginEmail(email, link) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  const from = process.env.MAIL_FROM || 'Volt HR Hub <login@ermalasllani.eu>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      ...(process.env.MAIL_REPLY_TO ? { reply_to: process.env.MAIL_REPLY_TO } : {}),
      subject: 'Your sign-in link for the Volt HR Hub',
      text:
        `Hi,\n\nUse this link to sign in to the Volt Europa HR Hub:\n\n${link}\n\n` +
        `The link works for 15 minutes. If you did not request it, you can ignore this email.\n`,
      html:
        `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#1d1230;line-height:1.5">` +
        `<p>Hi,</p><p>Use the button below to sign in to the Volt Europa HR Hub.</p>` +
        `<p><a href="${link}" style="display:inline-block;background:#502379;color:#ffffff;` +
        `text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">Sign in</a></p>` +
        `<p style="font-size:14px;color:#5b5170">The link works for 15 minutes. ` +
        `If you did not request it, you can ignore this email.</p></div>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
}

module.exports = { sendLoginEmail };
