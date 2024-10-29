export const formConfirmationMessage = (
  email: string,
  verificationCode: string
) =>
  `Hi ${email},
    Welcome to Telware! We're excited to have you onboard.
    Please verify your email address by entering the following confirmation code:
    ${verificationCode}
    If you didn't request this, please ignore this email.
    Best regards,
    -Telware Team 🐦‍⬛
    If you have any questions, feel free to reach out to us at telware.sw@gmail.com`;

export const formConfirmationMessageHtml = (
  email: string,
  verificationCode: string
) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f7;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .email-container {
          background-color: #ffffff;
          padding: 20px;
          margin: 0 auto;
          max-width: 600px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          color: #fff;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }
        .header img {
          max-width: 150px;
          margin-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }
        .message-body {
          padding: 20px;
          font-size: 16px;
          line-height: 1.6;
        }
        .code-box {
          background-color: #0e92f4;
          color: #fff;
          padding: 15px;
          margin: 20px 0;
          text-align: center;
          font-size: 24px;
          letter-spacing: 2px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 10px;
          font-size: 12px;
          color: #777;
        }
        .footer a {
          color: #87CEEB;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src='https://t9012337468.p.clickup-attachments.com/t9012337468/f9be04cb-145f-4c1e-aeba-a1e6ec3d8a56/App%20icon.png' alt="Telware Logo" />
          <h1>Welcome to Telware!</h1>
        </div>
        <div class="message-body">
          <p>Hi <strong>${email}</strong>,</p>
          <p>We're excited to have you onboard at <strong>Telware</strong>! To get started, please verify your email address by entering the confirmation code below:</p>
          <div class="code-box">
            ${verificationCode}
          </div>
          <p>If you didn't request this, feel free to ignore this email. The code will expire in 10 minutes.</p>
          <p>Best regards,<br><strong>Telware Team 🐦‍⬛</strong></p>
        </div>
        <div class="footer">
          <p>If you have any questions, feel free to reach out to us at <a href="telware@gmail.com">telware@gmail.com</a>.</p>
        </div>
      </div>
    </body>
    </html>
    `;

export const fromResetPasswordMessage = (email: string, resetURL: string) =>
  `Hi ${email},
    Forgot your password? Click this link to set your new password:
    ${resetURL}

    If you didn't forget your password, please ignore this email.
    Best regards,
    -Telware Team 🐦‍⬛
    If you have any questions, feel free to reach out to us at telware.sw@gmail.com`;
