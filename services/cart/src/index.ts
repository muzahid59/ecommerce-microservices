import express, {Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import morgan from 'morgan';
import { addToCart, getMyCart, clearCart } from './controllers';
import './events/onKeyExpires';
import './receiver'

dotenv.config();

const app = express();

// security middleware
app.use(helmet());

// rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    handler: (req, res) => {
      res
        .status(429)
        .json({ message: 'Too many requests, please try again later.' }); 
    }
});

app.use(limiter);

// request logger
app.use(morgan('dev'));
app.use(express.json());

// health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ message: 'API Gateway is healthy' });
});

// routes
app.get('/cart/get-my-cart', (req: Request, res: Response, next: NextFunction) => {
    getMyCart(req, res, next);
});
app.post('/cart/add-to-cart', (req: Request, res: Response, next: NextFunction) => {
   addToCart(req, res, next); 
});
app.post('/cart/clear-cart', (req: Request, res: Response, next: NextFunction) => {
    clearCart(req, res, next);
});


// 404 handler
app.use((_req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

// error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});


const port = process.env.PORT || 4005;
const serviceName = process.env || 'Cart-Service';
// Start the server
app.listen(port, () => {
    console.log(`${serviceName} listening on port ${port}`);
});

