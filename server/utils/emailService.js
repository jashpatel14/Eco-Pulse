const nodemailer = require("nodemailer");
const logger = require("./logger");

// Create reusable transporter (Singleton)
const createTransporter = () => {
  const port = parseInt(process.env.EMAIL_PORT);
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

// ─── Send Reset Password Email ───────────────────────────
const sendResetPasswordEmail = async (to, name, resetUrl) => {
  try {
    const mailOptions = {
      from: `"EcoPulse" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Reset Your Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0f23; color: #e0e0e0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .content p { color: #b0b0c5; line-height: 1.7; font-size: 15px; }
            .btn { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #fff !important; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 20px 0; }
            .footer { padding: 20px 30px; text-align: center; border-top: 1px solid #2a2a4a; }
            .footer p { color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${name}</strong>,</p>
              <p>We received a request to reset your password. Click the button below to set a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="btn">Reset Password</a>
              </p>
              <p>This link will expire in <strong>1 hour</strong>.</p>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>EcoPulse &copy; ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`📧 Reset email sent: ${info.messageId}`);

    if (process.env.EMAIL_HOST === "smtp.ethereal.email") {
      logger.info(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    logger.error("❌ Failed to send reset password email:", error.message);
    return null;
  }
};

module.exports = { sendResetPasswordEmail };
