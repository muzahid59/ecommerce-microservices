"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@/schemas");
const redis_1 = __importDefault(require("@/redis"));
const uuid_1 = require("uuid");
const config_1 = require("@/config");
const addToCart = async (req, res, next) => {
    try {
        // validate request body
        const parseBody = schemas_1.cartItemSchema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({
                message: 'Invalid request body',
                errors: parseBody.error.errors,
            });
        }
        let cartSessionId = req.headers['cart-session-id'] || null;
        // check if cart session id exists and also live in redis
        if (cartSessionId) {
            const exists = await redis_1.default.exists(`session:${cartSessionId}`);
            console.log('exists', exists);
            if (!exists) {
                cartSessionId = null;
            }
        }
        if (!cartSessionId) {
            // create a new cart session id
            cartSessionId = (0, uuid_1.v4)();
            console.log('New cart session id', cartSessionId);
            // set the cart session id in redis
            await redis_1.default.setex(`session:${cartSessionId}`, config_1.CART_TTL, cartSessionId);
            // set the cart session id in the response header
            res.setHeader('cart-session-id', cartSessionId);
        }
        // add item to cart
        await redis_1.default.hset(`cart:${cartSessionId}`, parseBody.data.productId, JSON.stringify({
            inventoryId: parseBody.data.inventoryId,
            quantity: parseBody.data.quantity,
        }));
        return res.status(200).json({
            message: 'Item added to cart',
        });
        // TODO: check if the inventory id exists in the inventory service
        // TODO: update the inventory service with the new cart item
    }
    catch (error) {
        next(error);
    }
};
exports.default = addToCart;
