//TODO: to be tested
export interface IReCaptchaResponse {
  message: string;
  response: number;
}

export const verifyReCaptcha = async (
  recaptchaResponse: string
): Promise<IReCaptchaResponse> => {
  if (!recaptchaResponse)
    return { message: 'please validate the recaptcha', response: 400 };

  const verificationURL: string = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaResponse}`;
  const verificationResponse = await fetch(verificationURL, {
    method: 'POST',
  });
  const verificationResponseData = await verificationResponse.json();
  if (!verificationResponseData.success)
    return { message: 'reCaptcha verification failed', response: 400 };
  return { message: 'recaptcha is verified', response: 200 };
};
