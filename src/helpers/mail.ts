import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:3000/reset-password/${token}`;

  await resend.emails.send({
    from: `onboarding@resend.dev`,
    to: email,
    subject: 'Reset your password',
    html: `<p>Click here <a href="${resetLink}">here</a> to reset password.</p>`,
  });
};
