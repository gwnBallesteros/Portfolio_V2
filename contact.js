// /api/contact.js — Vercel Serverless Function (Node.js)
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, company, phone, service, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  const text = String(message);
  if (text.length > 6000) {
    return res.status(400).json({ error: 'Message too long.' });
  }

  try {
    const {
      EMAIL_HOST = 'smtp.gmail.com',
      EMAIL_PORT = '465',
      EMAIL_SECURE = 'true',
      EMAIL_USER,
      EMAIL_PASS,
      EMAIL_TO,
      EMAIL_FROM
    } = process.env;

    if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
      return res.status(500).json({ error: 'Email is not configured on the server.' });
    }

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT),
      secure: EMAIL_SECURE === 'true',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });

    const html = `
      <h2>New inquiry from ${name}</h2>
      <p><strong>Email:</strong> ${email}</p>
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      ${service ? `<p><strong>Service:</strong> ${service}</p>` : ''}
      <hr />
      <p>${text.replace(/\n/g, '<br/>')}</p>
    `;

    await transporter.sendMail({
      to: EMAIL_TO,
      from: EMAIL_FROM || `Gwen Ballesteros Site <${EMAIL_USER}>`,
      replyTo: email,
      subject: `New website message from ${name}${company ? ' @ ' + company : ''}`,
      text: `From: ${name}
Email: ${email}
Company: ${company || '-'}
Phone: ${phone || '-'}
Service: ${service || '-'}

${text}`.trim(),
      html
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ error: 'Failed to send. Please email directly.' });
  }
}
