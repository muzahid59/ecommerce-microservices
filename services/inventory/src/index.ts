import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import { createInventory, getInventoryById, getInventoryDetails, updateInventory } from './controllers'
import prisma from './prisma';

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ message: 'Service is healthy' });
});

// routes 
app.get('/inventories/:id/details', (req: Request, res: Response, next: NextFunction) => {
    getInventoryDetails(req, res, next);
});
app.get('/inventories/:id', (req: Request, res: Response, next: NextFunction) => {
    getInventoryById(req, res, next);
});
app.put('/inventories/:id', (req: Request, res: Response, next: NextFunction) => {
    updateInventory(req, res, next);
});
app.post('/inventories', (req: Request, res: Response, next: NextFunction) => {
    createInventory(req, res, next);
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

const port = process.env.PORT || 4002;
const serviceName = process.env || 'Inventory-Service';


// Start the server
app.listen(port, () => {
    console.log(`${serviceName} listening on port ${port}`);
});
