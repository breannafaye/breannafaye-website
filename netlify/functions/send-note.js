/**
 * Post-it → Resend
 * Env:
 *   RESEND_API_KEY  (required) — set in Netlify site env
 *   RESEND_FROM     (optional) — verified sender, e.g. "Breanna Faye <notes@breannafaye.com>"
 *                               defaults to Resend onboarding sender for first tests
 * Recipient is fixed: breannafaye.eth@gmail.com
 */
const RECIPIENT = 'breannafaye.eth@gmail.com';
const DEFAULT_FROM = 'Breanna Faye <onboarding@resend.dev>';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, {});
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return json(500, { error: 'Missing RESEND_API_KEY' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return json(400, { error: 'Invalid JSON' });
  }

  // Honeypot (bots)
  if (payload.company) {
    return json(200, { ok: true });
  }

  const from = String(payload.from || '').trim().slice(0, 200);
  const message = String(payload.message || '').trim().slice(0, 5000);
  const subject = String(payload.subject || 'Hello from breannafaye.com').trim().slice(0, 200);

  if (!message) {
    return json(400, { error: 'Message required' });
  }

  const textLines = [message];
  if (from) textLines.push('', 'From: ' + from);

  const emailBody = {
    from: process.env.RESEND_FROM || DEFAULT_FROM,
    to: [RECIPIENT],
    subject: subject || 'Hello from breannafaye.com',
    text: textLines.join('\n')
  };
  if (from && /.+@.+\..+/.test(from)) {
    emailBody.reply_to = from;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailBody)
    });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      return json(res.status, {
        error: (data && (data.message || data.error)) || 'Resend request failed'
      });
    }
    return json(200, { ok: true, id: data.id || null });
  } catch (err) {
    return json(502, { error: 'Could not reach Resend' });
  }
};
