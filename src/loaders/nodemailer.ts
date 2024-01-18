import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'aman.kumar.jha953@gmail.com',
    pass: 'xtkigfhdbnlflpkj',
  },
});

transporter.verify().then(console.log).catch(console.error);
