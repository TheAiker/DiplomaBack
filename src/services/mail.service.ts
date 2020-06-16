import { createTransport, TestAccount, Transporter } from 'nodemailer';
import { ProductEntity } from '../entities';
import { OrderPaymentType } from '../enums';
import { TMakeNewOrderRequest, TOrderProductItem } from '../types';
import { formatMoney } from '../utils';

export class MailService {

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

    async sendOrder(request: TMakeNewOrderRequest, products: Array<ProductEntity>): Promise<void> {
        if (this.transport === null) {
            throw new Error('Feedback email transport is not initialized');
        }

        const from = `${process.env.EMAIL_SMTP_USER}@${process.env.EMAIL_DOMAIN}`;
        const subject = 'Новый заказ';

        console.debug(`New order by ${request.fullName}`);

        const address = request.paymentType === OrderPaymentType.PickupPayment ? '' : (
            `Адрес доставки: г. ${request.address.city}, ул. ${request.address.street} ${request.address.house}, кв. ${request.address.flat}\n`
        );
        const productList = request.products.map((item: TOrderProductItem, index: number) => {
            const product = products[index];

            return `${index + 1}. ${product.name} - ${formatMoney(product.price)} - ${item.amount} шт. - ${formatMoney(product.price * item.amount)}\n`;
        });
        const totalSum = request.products.reduce((acc: number, item: TOrderProductItem, index: number) => {
            const product = products[index];
            return acc + (product.price * item.amount);
        }, 0);

        await this.transport.sendMail({
            from,
            to: from,
            subject,
            text: `
                Заказчик: ${request.fullName}
                Номер телефона: ${request.phoneNumber}
                Email: ${request.email}
                ${address}

                № / Название продукта / Цена 1 шт. / Количество / Сумма
                ${productList}

                Итого: ${formatMoney(totalSum)}
            `
        });
    }

}

export const mailService = new MailService();
