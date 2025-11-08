import nodemailer from "nodemailer";

export async function sendEmail(to, subject, text, html) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or smtp config
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASSWORD, // your App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error);
    throw error;
  }
}
