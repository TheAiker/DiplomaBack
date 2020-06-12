import { Application, Router, Request, Response } from 'express';
import { get as lodashGet } from 'lodash';
import { CategoryEntity } from '../entities';
import { checkIfProvided, handleResponse, ValidationError } from '../utils';

export class CategoryController {

    static register(app: Application, routePrefix: string): CategoryController {
        return new CategoryController(app, routePrefix);
    }

    private router: Router = Router();

    constructor(private app: Application, private routePrefix: string) {
        this.router.get('/', this.getCategories);
        this.router.post('/create', this.createCategory);

        this.app.use(this.routePrefix, this.router);
    }

    getCategories = async (request: Request, response: Response) => {
        try {
            const categories = await CategoryEntity.find();

            handleResponse(response, categories);
        } catch (error) {
            handleResponse(response, error);
        }
    };

    createCategory = async (request: Request, response: Response) => {
        try {
            const { name } = request.body;

            checkIfProvided(request.body, 'name');

            const newCategory = new CategoryEntity();
            newCategory.name = name;
            await newCategory.save();

            handleResponse(response, newCategory);
        } catch (error) {
            handleResponse(response, error);
        }
    };

}

