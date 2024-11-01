import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';

const telwareTeam: string = 'Telware <telware.sw@gmail.com>';

const createTransporter = (provider: string) => {
  if (provider === 'gmail')
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.TELWARE_EMAIL,
        pass: process.env.TELWARE_PASSWORD,
      },
    });

  return nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAIL_PORT),
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });
};

const sendEmail = async (options: any) => {
  const transporter = createTransporter('mailtrap');

  const mailOptions: MailOptions = {
    from: telwareTeam,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.htmlMessage,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
