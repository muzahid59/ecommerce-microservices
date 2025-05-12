"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessTokenSchema = exports.UserLoginSchema = exports.UserCreateSchema = void 0;
const zod_1 = require("zod");
exports.UserCreateSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(5).max(255),
    name: zod_1.z.string().min(3).max(255),
});
exports.UserLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.AccessTokenSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
});
