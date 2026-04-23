export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    // --- Spam checks ---
    if (data._honeypot) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const timestamp = parseInt(data._timestamp, 10);
    if (!timestamp || Date.now() - timestamp < 2000) {
      return new Response(JSON.stringify({ error: 'Too fast' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Extract fields ---
    const name = data.name || 'No name provided';
    const email = data.email || '';
    const phone = data.phone || 'Not provided';
    const inquiryType = data.inquiry_type || 'General Inquiry';
    const message = data.message || 'No message provided';

    // --- Send notification email to client (HTML) ---
    const notificationHtml = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#333;line-height:1.6;">
<h2 style="color:#2F5733;margin:0 0 16px 0;">New Website Inquiry</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email || 'Not provided'}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>Inquiry Type:</strong> ${inquiryType}</p>
<p><strong>Message:</strong><br>${message}</p>
</div>`;

    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'Western PA Supply', email: 'info@westernpasupply.com' },
        to: [{ email: 'info@westernpasupply.com' }],
        replyTo: email ? { email: email, name: name } : undefined,
        subject: `New ${inquiryType} from ${name}`,
        htmlContent: notificationHtml,
      }),
    });

    // --- Send auto-reply to submitter (plain text, only if email provided) ---
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
3561 Valley Drive, Pittsburgh, PA 15236
(412) 643-9638 | info@westernpasupply.com
Mon-Fri: 7:00 AM - 5:00 PM | Sat: 8:00 AM - 2:00 PM`;

      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: 'Western PA Supply', email: 'info@westernpasupply.com' },
          to: [{ email: email, name: name }],
          subject: 'We received your inquiry - Western PA Supply',
          textContent: autoReplyText,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
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
