import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { getEmails, sendEmail } from './controllers';



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
//     console.log('Origin:', origin);
//     if (allowedOrigins.includes(origin)) {  
//         req.headers['Access-Control-Allow-Origin'] = origin;
//         next();
//     } else {
//         res.status(403).json({ message: 'Forbidden' });
//     }
// });

// routes
app.post('/emails/send', (req, res, next) => {
    sendEmail(req, res, next).catch(next);
});

app.get('/emails', (req, res, next) => {
    getEmails(req, res, next).catch(next);
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

const port = process.env.PORT || 4004;
const serviceName = process.env || 'Email-Service';


// Start the server
app.listen(port, () => {
    console.log(`${serviceName} listening on port ${port}`);
});
