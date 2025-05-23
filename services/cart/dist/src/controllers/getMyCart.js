"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("@/redis"));
const getMyCart = async (req, res, next) => {
    try {
        const cartSessionId = req.headers['cart-session-id'] || null;
        if (!cartSessionId) {
            return res.status(200).json({
                data: []
            });
        }
        // get cart items from redis
        const cart = await redis_1.default.hgetall(`cart:${cartSessionId}`);
        if (!cart) {
            return res.status(200).json({
                data: []
            });
        }
        return res.status(200).json({
            data: cart
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = getMyCart;
