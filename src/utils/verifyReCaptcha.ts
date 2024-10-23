import { Response } from 'express';

const verifyReCaptcha = (recaptchaResponse: string, res: Response): boolean => {
  if (!recaptchaResponse || recaptchaResponse === '')
    res.status(400).json({
      status: 'fail',
      message: 'please validate the recaptcha',
    });

    const verificationURL: string = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaResponse}`
  return true;
};

export default verifyReCaptcha;
