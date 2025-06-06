import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import {createProduct, getProducts, getProductDetails, getProductById, updateProduct} from './controllers';


dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ message: 'Service is healthy' });
});

// app.use((req: Request, res: Response, next: NextFunction) => {
//     const allowedOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081'];
//     const origin = req.headers.origin || '';
//     if (allowedOrigins.includes(origin)) {  
//         req.headers['Access-Control-Allow-Origin'] = origin;
//         next();
//     } else {
//         res.status(403).json({ message: 'Forbidden' });
//     }
// });

// Products routes
app.get('/products', (req: Request, res: Response, next: NextFunction) => {
    getProducts(req, res, next);
});

app.get('/products/:id/details', (req: Request, res: Response, next: NextFunction) => {
    getProductDetails(req, res, next);
});

app.get('/products/:id', (req: Request, res: Response, next: NextFunction) => {
    getProductById(req, res, next);
});

app.put('/products/:id', (req: Request, res: Response, next: NextFunction) => {
    updateProduct(req, res, next);
});

app.post('/products', (req: Request, res: Response, next: NextFunction) => {
    createProduct(req, res, next);  
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ message: 'Not Found'});
});
    
// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

const port = process.env.PORT || 4001;
const serviceName = process.env || 'Product-Service';


// Start the server
app.listen(port, () => {
    console.log(`${serviceName} listening on port ${port}`);
});
