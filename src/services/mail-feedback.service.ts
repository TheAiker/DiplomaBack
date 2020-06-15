import { createTransport, TestAccount, Transporter } from 'nodemailer';

export class MailFeedbackService {

    private transport: Transporter | null = null;

    async init(): Promise<void> {
        const port = +(process.env.EMAIL_SMTP_PORT || '');
        const secure = ['yes', 'true'].includes(process.env.EMAIL_SMTP_SECURE || '');

        this.transport = await createTransport({
            host: process.env.EMAIL_SMTP_HOST || 'smtp.yandex.com',
            port: !isNaN(port) ? port : 465,
            secure,
            auth: {
                user: process.env.EMAIL_SMTP_USER || '',
                pass: process.env.EMAIL_SMTP_PASS || ''
            }
        });
    }

    async sendFeedback(authorName: string, authorEmail: string, authorMessage: string): Promise<void> {
        if (this.transport === null) {
            throw new Error('Feedback email transport is not initialized');
        }

        const from = `${process.env.EMAIL_SMTP_USER}@${process.env.EMAIL_DOMAIN}`;
        const subject = `Feedback Submition by ${authorName} <${authorEmail}>`;

        console.debug(`Sending feedback email to ${from}`);
        console.debug(`Subject: ${subject}`);
        console.debug(`Message: ${authorMessage}`);

        await this.transport.sendMail({
            from,
            to: from,
            subject,
            text: authorMessage
        });
    }

}

export const mailFeedbackService = new MailFeedbackService();
