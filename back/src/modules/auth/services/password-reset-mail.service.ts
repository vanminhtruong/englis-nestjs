import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Nodemailer is already an installed dependency. It is loaded only when an
// email is sent, rather than opening SMTP connections during app startup.
@Injectable()
export class PasswordResetMailService {
  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'].every((key) =>
      Boolean(this.config.get<string>(key)?.trim()),
    );
  }

  async sendCode(email: string, code: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Password recovery email is not configured');
    }

    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new ServiceUnavailableException('Invalid SMTP configuration');
    }

    const nodemailer = require('nodemailer') as typeof import('nodemailer');
    const transport = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    try {
      await transport.sendMail({
        from: this.config.get<string>('SMTP_FROM'),
        to: email,
        subject: 'VocabMaster - Password reset verification code',
        text: `Your VocabMaster password reset code is: ${code}\n\nIt expires in 10 minutes. If you did not request this, ignore this email. Never share this code.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#202126">
          <h2>VocabMaster</h2>
          <p>Use this verification code to reset your password:</p>
          <p style="font-size:30px;font-weight:700;letter-spacing:7px">${code}</p>
          <p>The code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color:#656565;font-size:13px">If this wasn't you, ignore this message.</p>
        </div>`,
      });
    } finally {
      transport.close();
    }
  }
}
