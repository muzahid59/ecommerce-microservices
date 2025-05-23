"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartItemSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.cartItemSchema = zod_1.default.object({
    id: zod_1.default.string(),
    inventoryId: zod_1.default.string(),
    productId: zod_1.default.string(),
    quantity: zod_1.default.number().min(1),
});
