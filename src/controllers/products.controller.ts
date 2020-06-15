import { createHash } from 'crypto';
import { Application, Router, Request, Response } from 'express';
import { writeFile } from 'fs';
import multer from 'multer';
import { get as lodashGet } from 'lodash';
import { resolve } from 'path';
import sharp from 'sharp';
import { promisify } from 'util';
import { CategoryEntity, ImageEntity, ProductEntity } from '../entities';
import { checkIfProvided, checkIfValidNumber, handleResponse, ValidationError } from '../utils';

const writeFileAsync = promisify(writeFile);

export class ProductsController {

    static register(app: Application, routePrefix: string): ProductsController {
        return new ProductsController(app, routePrefix);
    }

    private multer: ReturnType<typeof multer>;
    private router: Router = Router();

    constructor(private app: Application, private routePrefix: string) {
        this.multer = multer({ storage: multer.memoryStorage() });

        this.router.get('/', this.getProducts);
        this.router.post('/create', this.createProduct);
        this.router.post('/delete', this.deleteProduct);
        this.router.post('/preview-upload', this.multer.single('previewImage'), this.uploadProductPreview);

        this.app.use(this.routePrefix, this.router);
    }

    getProducts = async (request: Request, response: Response) => {
        try {
            const products = await ProductEntity.find({ relations: ['category', 'previewImage'] });

            handleResponse(response, products);
        } catch (error) {
            handleResponse(response, error);
        }
    };

    createProduct = async (request: Request, response: Response) => {
        try {
            const { name, description, price } = request.body;

            checkIfProvided(request.body, 'name');
            checkIfProvided(request.body, 'price');
            checkIfProvided(request.body, 'category');

            checkIfValidNumber(request.body, 'price');
            checkIfValidNumber(request.body, 'category');

            console.debug('category', request.body.category);

            const foundCategory = await CategoryEntity.findOne(request.body.category);

            if (!foundCategory) {
                throw new ValidationError('Выбранная категория не существует');
            }

            const newProduct = new ProductEntity();
            newProduct.name = name;
            newProduct.price = +price;
            newProduct.category = foundCategory;
            await newProduct.save();

            handleResponse(response, newProduct);
        } catch (error) {
            handleResponse(response, error);
        }
    };

    deleteProduct = async (request: Request, response: Response) => {
        try {
            const { productId } = request.body;

            checkIfProvided(request.body, 'productId');
            checkIfValidNumber(request.body, 'productId');

            const foundProduct = await ProductEntity.findOne(productId);

            if (!foundProduct) {
                throw new ValidationError(`Product with id = ${productId} couldn't be found`);
            }

            await foundProduct.remove();

            handleResponse(response, {});
        } catch (error) {
            handleResponse(response, error);
        }
    };

    uploadProductPreview = async (request: Request, response: Response): Promise<void> => {
        try {
            const { productId } = request.body;

            checkIfProvided(request.body, 'productId');

            const product = await ProductEntity.findOne(productId, { relations: ['previewImage'] });

            if (!product) {
                throw new ValidationError(`Не удалось найти продукт с id '${productId}'`);
            }

            const inputBuffer: Buffer = request.file.buffer;
            const convertedBuffer = await sharp(inputBuffer).png().resize(240, 240, { fit: 'fill' }).toBuffer();
            const hash = createHash('sha256').update(convertedBuffer).digest('hex');
            const fileName = `${hash}.png`;
            const filePath = resolve(__dirname, 'static/preview-uploads', fileName);

            await writeFileAsync(filePath, convertedBuffer);

            const newPreviewImage = product.previewImage || new ImageEntity();
            newPreviewImage.hash = hash;
            await newPreviewImage.save();
            await newPreviewImage.reload();

            product.previewImage = newPreviewImage;
            await product.save();

            handleResponse(response, {});
        } catch (error) {
            handleResponse(response, error);
        }
    }

}
