import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import mkdirp from 'mkdirp';
import { resolve } from 'path';
import { createConnection } from 'typeorm';
import { CategoryController, ProductsController } from './controllers';
import { CategoryEntity, ImageEntity, ProductEntity } from './entities';

const HOST = process.env.HOST || '127.0.0.1';
const PORT = +(process.env.PORT || '8080');

const ensureDirectoryExists = (path: string): Promise<unknown> => mkdirp(resolve(__dirname, path));

async function run(): Promise<void> {
    // Create express application serve/
    const app = express();

    await ensureDirectoryExists('static/preview-uploads');

    app.use('/static', express.static(resolve(__dirname, 'static')));
    app.use('/api', bodyParser.json());

    // Connect to database; ensure every entity table is properly initialized
    await createConnection({
        type: 'sqlite',
        database: './db.sql',
        entities: [CategoryEntity, ImageEntity, ProductEntity],
        synchronize: true
    });

    CategoryController.register(app, '/api/categories');
    ProductsController.register(app, '/api/products');

    // Start listening for requests on given port
    app.listen(PORT, HOST);
    console.log('Server is up and ready to serve');
}

run();
