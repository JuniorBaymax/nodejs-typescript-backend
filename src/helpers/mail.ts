import { InternalErrorResponse } from '../core/ApiResponse.js';
import Logger from '../core/Logger.js';
import { transporter } from '../loaders/nodemailer.js';

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:5000/reset-password/${token}`;
  await transporter
    .sendMail({
      from: '"Testing" <aman.kumar.jha953@gmail.com>', // sender address
      to: email, // list of receivers
      subject: 'Reset your password', // Subject line
      text: 'This is test mail', // plain text body
      html: `<p>Click here <a href="${resetLink}">here</a> to reset password.</p>`,
    })
    .then((info) => {
      console.log({ info });
      Logger.info(info);
    })
    .catch((error) => {
      throw new InternalErrorResponse(error);
    });
};
