import { OrderPaymentType } from '../enums';
import { TAddress } from './common.types';

export type TOrderProductItem = {
    amount: number;
    productId: number;
};

export type TMakeNewOrderRequest = {
    address: TAddress;
    email: string;
    fullName: string;
    paymentType: OrderPaymentType;
    phoneNumber: string;
    products: Array<TOrderProductItem>;
};
