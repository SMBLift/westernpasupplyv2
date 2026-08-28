const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const BREVO_TIMEOUT_MS = 10000;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Throws unless Brevo accepted the message, so callers can tell delivery apart
// from failure. Without this a 401 or 429 looks identical to a sent email.
async function sendBrevoEmail(apiKey, payload) {
  const res = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(BREVO_TIMEOUT_MS),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Brevo responded ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }

  // --- Spam checks ---
  if (data._honeypot) {
    return json({ success: true });
  }

  const timestamp = parseInt(data._timestamp, 10);
  if (!timestamp || Date.now() - timestamp < 2000) {
    return json({ error: 'Too fast' }, 400);
  }

  // --- Extract fields ---
  const name = data.name || 'No name provided';
  const email = data.email || '';
  const phone = data.phone || 'Not provided';
  const inquiryType = data.inquiry_type || 'General Inquiry';
  const message = data.message || 'No message provided';

  if (!env.BREVO_API_KEY) {
    console.error('submit: BREVO_API_KEY is not configured — cannot deliver inquiry');
    return json({ error: 'Server error' }, 500);
  }

  const notificationHtml = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#333;line-height:1.6;">
<h2 style="color:#2F5733;margin:0 0 16px 0;">New Website Inquiry</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email || 'Not provided'}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>Inquiry Type:</strong> ${inquiryType}</p>
<p><strong>Message:</strong><br>${message}</p>
</div>`;

  // --- Notification to the client: this one has to land ---
  try {
    await sendBrevoEmail(env.BREVO_API_KEY, {
      sender: { name: 'Western PA Supply', email: 'info@westernpasupply.com' },
      to: [{ email: 'info@westernpasupply.com' }],
      replyTo: email ? { email: email, name: name } : undefined,
      subject: `New ${inquiryType} from ${name}`,
      htmlContent: notificationHtml,
    });
  } catch (err) {
    // Log the inquiry itself so a failed send is still a recoverable lead
    // rather than a silent loss.
    console.error(
      'submit: notification email FAILED —', err.message,
      '| lead:', JSON.stringify({ name, email, phone, inquiryType, message }).slice(0, 800)
    );
    // Non-2xx makes the front end tell the visitor to call instead of
    // showing a success message for a message that never arrived.
    return json({ error: 'Delivery failed' }, 502);
  }

  // --- Auto-reply to the submitter: best effort, never fails the request ---
  if (email) {
    const autoReplyText = `Hi ${name},

Thank you for reaching out to Western PA Supply. We have received your inquiry and a member of our team will get back to you as soon as possible.

Your inquiry type: ${inquiryType}

Our regular business hours are Monday through Friday from 7:00 AM to 5:00 PM, and Saturday from 8:00 AM to 2:00 PM. We do our best to respond to all inquiries within the same business day.

If you need immediate assistance, please call us directly at (412) 643-9638. We are always happy to help.

Thank you,
Western PA Supply

--
Western PA Supply
3561 Valley Drive, Pittsburgh, PA 15234
(412) 643-9638 | info@westernpasupply.com
Mon-Fri: 7:00 AM - 5:00 PM | Sat: 8:00 AM - 2:00 PM`;

    try {
      await sendBrevoEmail(env.BREVO_API_KEY, {
        sender: { name: 'Western PA Supply', email: 'info@westernpasupply.com' },
        to: [{ email: email, name: name }],
        subject: 'We received your inquiry - Western PA Supply',
        textContent: autoReplyText,
      });
    } catch (err) {
      // The inquiry already reached the client, so the visitor still gets a
      // success message; only the courtesy auto-reply was lost.
      console.error('submit: auto-reply to submitter failed —', err.message);
    }
  }

  return json({ success: true });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
