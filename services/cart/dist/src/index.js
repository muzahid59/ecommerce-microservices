"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const controllers_1 = require("./controllers");
dotenv_1.default.config();
const app = (0, express_1.default)();
// security middleware
app.use((0, helmet_1.default)());
// rate limiting middleware
const limiter = (0, express_rate_limit_1.default)({
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
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ message: 'API Gateway is healthy' });
});
// routes
app.get('/cart/get-my-cart', (req, res, next) => {
    (0, controllers_1.getMyCart)(req, res, next);
});
app.post('/cart/add-to-cart', (req, res, next) => {
    (0, controllers_1.addToCart)(req, res, next);
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ message: 'Not Found' });
});
// error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});
const port = process.env.PORT || 4005;
const serviceName = process.env || 'Cart-Service';
// Start the server
app.listen(port, () => {
    console.log(`${serviceName} listening on port ${port}`);
});
