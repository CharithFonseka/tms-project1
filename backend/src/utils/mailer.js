const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendWelcomeEmail(toEmail, tempPassword) {
  await transporter.sendMail({
    from: `"TMS System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your TMS Account has been created',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #4f46e5;">Welcome to TMS 👋</h2>
        <p>Your account has been created. Use the credentials below to sign in:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Email:</td>
            <td style="padding: 8px;">${toEmail}</td>
          </tr>
          <tr style="background: #f8f8f8;">
            <td style="padding: 8px; font-weight: bold;">Temporary Password:</td>
            <td style="padding: 8px; font-family: monospace; font-size: 16px;">${tempPassword}</td>
          </tr>
        </table>
        <p style="margin-top: 16px; color: #555;">
          You will be asked to set a new password after your first login.
        </p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
           style="display: inline-block; margin-top: 16px; padding: 10px 20px; 
                  background: #4f46e5; color: white; text-decoration: none; border-radius: 6px;">
          Sign In Now
        </a>
      </div>
    `,
  });
}

module.exports = { sendWelcomeEmail };
