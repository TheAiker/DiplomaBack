import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mkdirp from 'mkdirp';
import { resolve } from 'path';
import { createConnection } from 'typeorm';
import { CategoryController, FeedbackController, ProductsController, OrderController } from './controllers';
import { CategoryEntity, ImageEntity, ProductEntity } from './entities';
import { mailService } from './services';

dotenv.config();

const isProduction = process.env.APP_ENV === 'prod';
const HOST = process.env.HOST || '127.0.0.1';
const PORT = +(process.env.PORT || '8080');

const ensureDirectoryExists = (path: string): Promise<unknown> => mkdirp(resolve(__dirname, path));

async function run(): Promise<void> {
    // Create express application serve/
    const app = express();

    await ensureDirectoryExists('static/preview-uploads');

    // Serve static files from /static route
    app.use('/static', express.static(resolve(__dirname, 'static')));

    // Parse application/json requests
    app.use('/api', bodyParser.json());

    // Connect to database
    const entities = [CategoryEntity, ImageEntity, ProductEntity];
    if (isProduction) {
        const dbConfigBase = require('../ormconfig.json');
        const dbConfig = {
            ...dbConfigBase,
            entities,
            synchronize: true
        };

        await createConnection(dbConfig);
    } else {
        await createConnection({
            type: 'sqlite',
            database: './db.sql',
            entities,
            synchronize: true
        });
    }

    await mailService.init();

    CategoryController.register(app, '/api/categories');
    FeedbackController.register(app, '/api/feedback');
    ProductsController.register(app, '/api/products');
    OrderController.register(app, '/api/orders');

    // Start listening for requests on given port
    app.listen(PORT, HOST);
    console.log('Server is up and ready to serve');
}

run().catch(console.error);
