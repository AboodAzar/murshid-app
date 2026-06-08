import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

resend.emails.send({
  from: 'info@murshidjo.com',
  to: 'aboodabed04@icloud.com',
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});