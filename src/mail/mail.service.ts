import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  async sendResetCode(email: string, code: string) {
    await this.transporter.sendMail({
      from: `"Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Код для сброса пароля',
      text: `Ваш код для сброса пароля: ${code}`,
    });
  }
}
