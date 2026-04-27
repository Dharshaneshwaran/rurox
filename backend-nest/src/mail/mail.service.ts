import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly brevoApiKey = process.env.BREVO_API_KEY ?? '';
  private readonly senderEmail =
    process.env.BREVO_SENDER_EMAIL ?? process.env.SMTP_FROM ?? '';
  private readonly senderName =
    process.env.BREVO_SENDER_NAME ?? 'Smart Teacher System';

  constructor() {}

  async sendStudentWelcomeEmail(email: string, name: string, plainPassword?: string) {
    const subject = 'Welcome to the School Platform!';

    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2e7d32;">Welcome, ${name}!</h2>
        <p>You have been successfully enrolled in our school platform.</p>
    `;

    if (plainPassword) {
      htmlContent += `
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin-top: 0;"><strong>Your Login Credentials:</strong></p>
          <p><strong>Email:</strong> ${email}</p>
          <p style="margin-bottom: 0;"><strong>Password:</strong> ${plainPassword}</p>
        </div>
        <p><em>Please keep this information safe and consider changing your password after your first login.</em></p>
      `;
    }

    htmlContent += `
        <p>Best regards,<br>The School Administration</p>
      </div>
    `;

    await this.deliverEmail({
      toEmail: email,
      toName: name,
      subject,
      htmlContent,
      fallbackLog: `[SIMULATED EMAIL] Welcome email for ${email} with password ${plainPassword}`,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
    const subject = 'Reset your password';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1f2937;">Password reset request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 6px;">
            Reset password
          </a>
        </p>
        <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
      </div>
    `;

    await this.deliverEmail({
      toEmail: email,
      toName: name,
      subject,
      htmlContent,
      fallbackLog: `[SIMULATED EMAIL] Password reset for ${email}: ${resetUrl}`,
    });
  }

  private async deliverEmail(payload: {
    toEmail: string;
    toName?: string;
    subject: string;
    htmlContent: string;
    fallbackLog: string;
  }) {
    if (!this.brevoApiKey || !this.senderEmail) {
      this.logger.warn(
        'Email service not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL to send emails.'
      );
      this.logger.log(payload.fallbackLog);
      return;
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': this.brevoApiKey,
        },
        body: JSON.stringify({
          sender: {
            name: this.senderName,
            email: this.senderEmail,
          },
          to: [
            {
              email: payload.toEmail,
              name: payload.toName,
            },
          ],
          subject: payload.subject,
          htmlContent: payload.htmlContent,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Brevo returned ${response.status}: ${errorBody}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${payload.toEmail}`,
        error instanceof Error ? error.stack : String(error)
      );
      this.logger.log(payload.fallbackLog);
    }
  }
}
