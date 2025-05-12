"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const controllers_1 = require("./controllers");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
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
    (0, controllers_1.userRegistration)(req, res, next).catch(next);
});
app.post('/auth/login', (req, res, next) => {
    (0, controllers_1.userLogin)(req, res, next).catch(next);
});
app.post('/auth/verify-token', (req, res, next) => {
    (0, controllers_1.verifyAccessToken)(req, res, next).catch(next);
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ message: 'Not Found' });
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});
const port = process.env.PORT || 4002;
const serviceName = process.env || 'User-Service';
// Start the server
app.listen(port, () => {
    console.log(`${serviceName} listening on port ${port}`);
});
