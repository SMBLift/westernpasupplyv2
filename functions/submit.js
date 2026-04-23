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

    // --- Send notification email to client ---
    const notificationHtml = `
      <h2 style="color:#2F5733;">New Website Inquiry</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Name</td><td style="padding:8px 12px;border:1px solid #ddd;">${name}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Email</td><td style="padding:8px 12px;border:1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Phone</td><td style="padding:8px 12px;border:1px solid #ddd;">${phone}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Inquiry Type</td><td style="padding:8px 12px;border:1px solid #ddd;">${inquiryType}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Message</td><td style="padding:8px 12px;border:1px solid #ddd;">${message}</td></tr>
      </table>
      <p style="color:#888;font-size:12px;margin-top:20px;">Sent from westernpasupply.com</p>
    `;

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
        subject: `New ${inquiryType} from ${name} — Western PA Supply Website`,
        htmlContent: notificationHtml,
      }),
    });

    // --- Send auto-reply to submitter (only if email provided) ---
    if (email) {
      const autoReplyHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#2F5733;padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">Western PA Supply Co</h1>
          </div>
          <div style="padding:24px;background:#ffffff;">
            <p>Hi ${name},</p>
            <p>Thank you for reaching out to Western PA Supply Co. We've received your inquiry and will get back to you as soon as possible — typically within 1 business hour during our operating hours.</p>
            <p><strong>Your inquiry:</strong> ${inquiryType}</p>
            <p>If you need immediate assistance, please call us at <strong>(412) 643-9638</strong>.</p>
            <p>Thank you,<br>Western PA Supply Co</p>
          </div>
          <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:12px;color:#888;">
            <p>3561 Valley Drive, Pittsburgh, PA 15236<br>(412) 643-9638 | info@westernpasupply.com</p>
            <p>Mon–Fri: 7:00 AM – 5:00 PM | Sat: 8:00 AM – 2:00 PM</p>
          </div>
        </div>
      `;

      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: 'Western PA Supply', email: 'info@westernpasupply.com' },
          to: [{ email: email, name: name }],
          subject: 'We received your inquiry — Western PA Supply Co',
          htmlContent: autoReplyHtml,
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
