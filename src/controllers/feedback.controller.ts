import { Application, Router, Request, Response } from 'express';
import { get as lodashGet } from 'lodash';
import { CategoryEntity, ProductEntity } from '../entities';
import { mailService } from '../services';
import { checkIfProvided, checkIfValidNumber, handleResponse, ValidationError } from '../utils';

export class FeedbackController {

    static register(app: Application, routePrefix: string): FeedbackController {
        return new FeedbackController(app, routePrefix);
    }

    private router: Router = Router();

    constructor(private app: Application, private routePrefix: string) {
        this.router.post('/send', this.sendFeedback);

        this.app.use(this.routePrefix, this.router);
    }

    sendFeedback = async (request: Request, response: Response) => {
        try {
            const { name, email, message } = request.body;

            checkIfProvided(request.body, 'name');
            checkIfProvided(request.body, 'email');
            checkIfProvided(request.body, 'message');

            await mailService.sendFeedback(name, email, message);

            handleResponse(response, {});
        } catch (error) {
            handleResponse(response, error);
        }
    };

}
