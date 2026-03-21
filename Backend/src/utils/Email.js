import nodemailer from 'nodemailer';

let cachedTransporter;
const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.EMAIL_TRANSPORT === 'ethereal' || !process.env.EMAIL_HOST) {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE || 'false') === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return cachedTransporter;
};

const sendEmail = async ({ to, subject, text, html, from }) => {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: from || process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log('Preview URL:', preview);
  }
  return info;
};

export { getTransporter as transporter, sendEmail };

