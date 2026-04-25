import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    // Standard SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    if (!process.env.SMTP_USER) {
      this.logger.warn('SMTP_USER is not set. Emails will be logged but not sent unless configured.');
    }
  }

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

    try {
      if (process.env.SMTP_USER) {
        const info = await this.transporter.sendMail({
          from: `"School Admin" <${process.env.SMTP_FROM || 'admin@school.com'}>`,
          to: email,
          subject,
          html: htmlContent,
        });
        this.logger.log(`Welcome email sent to ${email}: ${info.messageId}`);
      } else {
        // Fallback if no SMTP configured: just log it
        this.logger.log(`[SIMULATED EMAIL] Welcome email for ${email} with password ${plainPassword}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error instanceof Error ? error.stack : String(error));
    }
  }
}
