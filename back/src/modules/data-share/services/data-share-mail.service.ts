import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Best-effort email telling someone that data was shared with them.
 * The in-app dialog is the real mechanism, so a missing or failing SMTP setup
 * must never make sharing fail.
 */
@Injectable()
export class DataShareMailService {
  private readonly logger = new Logger(DataShareMailService.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'].every((key) =>
      Boolean(this.config.get<string>(key)?.trim()),
    );
  }

  async sendShareNotice(params: {
    to: string;
    senderName: string;
    senderEmail: string;
    vocabularyCount: number;
  }): Promise<void> {
    if (!this.isConfigured()) return;

    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    if (!Number.isInteger(port) || port < 1 || port > 65535) return;

    const appUrl = (this.config.get<string>('FRONTEND_URL') || '').trim();
    const name = escapeHtml(params.senderName || params.senderEmail);
    const email = escapeHtml(params.senderEmail);
    const link = appUrl
      ? `<p><a href="${escapeHtml(appUrl)}" style="color:#6d4aff">Open VocabMaster</a></p>`
      : '';

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
        to: params.to,
        subject: 'VocabMaster - Someone shared vocabulary data with you',
        text: `${params.senderName} (${params.senderEmail}) wants to share ${params.vocabularyCount} words with you. Log in to VocabMaster to accept or decline. Nothing is added until you accept.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#202126">
          <h2>VocabMaster</h2>
          <p><strong>${name}</strong> (${email}) wants to share <strong>${params.vocabularyCount}</strong> words with you.</p>
          <p>Log in to accept or decline. Nothing is added to your account until you accept.</p>
          ${link}
        </div>`,
      });
    } catch (error) {
      this.logger.warn(
        `Share notice email failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    } finally {
      transport.close();
    }
  }
}
