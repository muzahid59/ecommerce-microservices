import express, {Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import morgan from 'morgan';
import { configureRoutes } from './utils';

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

// configure routes
configureRoutes(app);

// health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ message: 'API Gateway is healthy' });
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

const post = process.env.PORT || 8081;
app.listen(post, () => {
    console.log(`API Gateway listening on port ${post}`);
});
