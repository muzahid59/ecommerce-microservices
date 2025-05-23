"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@/schemas");
const prisma_1 = __importDefault(require("@/prisma"));
const createUser = async (req, res, next) => {
    try {
        const parseBody = schemas_1.UserCreateSchema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({ message: parseBody.error.errors });
        }
        // check if user already exists
        const userExists = await prisma_1.default.user.findUnique({
            where: { authUserId: parseBody.data.authUserId }
        });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Create a new user
        const user = await prisma_1.default.user.create({
            data: parseBody.data,
        });
        // Return the created user
        res.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.default = createUser;
