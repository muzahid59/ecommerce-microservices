import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { userRegistration, userLogin, verifyAccessToken, verifyEmail } from './controllers';



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
app.post('/auth/registration', (req, res, next) => {
    userRegistration(req, res, next).catch(next);
});

app.post('/auth/login', (req, res, next) => {
    userLogin(req, res, next).catch(next);
});
app.post('/auth/verify-token', (req, res, next) => {
    verifyAccessToken(req, res, next).catch(next);
});
app.post('/auth/verify-email', (req, res, next) => {
    verifyEmail(req, res, next).catch(next);
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
const serviceName = process.env || 'User-Service';


// Start the server
app.listen(port, () => {
    console.log(`${serviceName} listening on port ${port}`);
});
