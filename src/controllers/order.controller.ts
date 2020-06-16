import { Application, Router, Request, Response } from 'express';
import { get as lodashGet } from 'lodash';
import { CategoryEntity, ProductEntity } from '../entities';
import { OrderPaymentType } from '../enums';
import { mailService } from '../services';
import { TMakeNewOrderRequest, TOrderProductItem } from '../types';
import { checkIfProvided, checkIfValidNumber, handleResponse, ValidationError } from '../utils';

export class OrderController {

    static register(app: Application, routePrefix: string): OrderController {
        return new OrderController(app, routePrefix);
    }

    private router: Router = Router();

    constructor(private app: Application, private routePrefix: string) {
        this.router.post('/new', this.makeAnOrder);

        this.app.use(this.routePrefix, this.router);
    }

    makeAnOrder = async (request: Request, response: Response) => {
        try {
            const { address, email, fullName, paymentType, phoneNumber, products = [] } = request.body as TMakeNewOrderRequest;

            checkIfProvided(request.body, 'address');
            checkIfProvided(request.body, 'email');
            checkIfProvided(request.body, 'fullName');
            checkIfProvided(request.body, 'paymentType');
            checkIfProvided(request.body, 'phoneNumber');
            checkIfProvided(request.body, 'products');

            if (!(products instanceof Array)) {
                throw new ValidationError(`Field 'products' has to be a valid id array`);
            }

            if (!products.length) {
                throw new ValidationError(`Field 'products' has to have at least a single product id`);
            }

            const productEntities = await ProductEntity.findByIds(products.map((item: TOrderProductItem) => item.productId));

            await mailService.sendOrder(request.body as TMakeNewOrderRequest, productEntities);

            handleResponse(response, {});
        } catch (error) {
            handleResponse(response, error);
        }
    };

}

