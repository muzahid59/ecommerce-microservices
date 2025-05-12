"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("@/prisma");
const schemas_1 = require("@/schemas");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyAccessToken = async (req, res, next) => {
    try {
        // validate request body
        const parseBody = schemas_1.AccessTokenSchema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({ errors: parseBody.error.errors });
        }
        // check if access token is valid
        const { accessToken } = parseBody.data;
        const decodedToken = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decodedToken.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        });
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return res.status(200).json({ message: 'Authorized', user });
    }
    catch (error) {
        next(error);
    }
};
exports.default = verifyAccessToken;
