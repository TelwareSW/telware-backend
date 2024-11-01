const generateConfirmationCode = () => {
  const confirmationCode: string = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return confirmationCode;
};

export default generateConfirmationCode;
