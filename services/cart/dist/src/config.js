"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVENTORY_SERVICE_URL = exports.CART_TTL = exports.REDIS_PORT = exports.REDIS_HOST = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: './.env',
});
exports.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
exports.REDIS_PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
exports.CART_TTL = process.env.CART_TTL ? parseInt(process.env.CART_TTL) : 60;
exports.INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:4000';
