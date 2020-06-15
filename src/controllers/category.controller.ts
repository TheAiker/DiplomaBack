import { Application, Router, Request, Response } from 'express';
import { get as lodashGet } from 'lodash';
import { CategoryEntity, ProductEntity } from '../entities';
import { checkIfProvided, checkIfValidNumber, handleResponse, ValidationError } from '../utils';

export class CategoryController {

    static register(app: Application, routePrefix: string): CategoryController {
        return new CategoryController(app, routePrefix);
    }

    private router: Router = Router();

    constructor(private app: Application, private routePrefix: string) {
        this.router.get('/', this.getCategories);
        this.router.post('/create', this.createCategory);
        this.router.post('/delete', this.deleteCategory);

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

    deleteCategory = async (request: Request, response: Response) => {
        try {
            const { categoryId } = request.body;

            checkIfProvided(request.body, 'categoryId');
            checkIfValidNumber(request.body, 'categoryId');

            const foundCategory = await CategoryEntity.findOne(categoryId, { relations: ['products'] });

            if (!foundCategory) {
                throw new ValidationError(`Category with id = ${categoryId} couldn't be found`);
            }

            if (foundCategory.products.length > 0) {
                const productIds = foundCategory.products.map((product: ProductEntity) => product.id);
                await ProductEntity.delete(productIds);
            }

            await foundCategory.remove();

            handleResponse(response, {});
        } catch (error) {
            handleResponse(response, error);
        }
    };

}

