import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: "maddison53@ethereal.email",
    pass: "jn7jnAPss4f63QBp6D",
  },
});

const sendEmail = async (options) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: process.env.EMAIL_SUBJECT,
    text: process.env.EMAIL_TEXT, // Plain-text version of the message
    html: process.env.EMAIL_HTML, // HTML version of the message
  });

  console.log("Message sent:", info.messageId);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
}


export { transporter, sendEmail };

