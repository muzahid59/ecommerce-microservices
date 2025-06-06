"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("@/prisma");
const schemas_1 = require("@/schemas");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createLoginHistory = async (info) => {
    await prisma_1.prisma.loginHistory.create({
        data: {
            userId: info.userId,
            ipAddress: info.ipAddress,
            userAgent: info.userAgent,
            attempt: info.attempt
        }
    });
};
const userLogin = async (req, res, next) => {
    try {
        const ipAddress = req.headers['x-forwarded-for'] || req.ip || '';
        const userAgent = req.headers['user-agent'] || '';
        // validate request body
        const parseBody = schemas_1.UserLoginSchema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({ errors: parseBody.error.errors });
        }
        // check if user exists
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: parseBody.data.email },
        });
        if (!user) {
            await createLoginHistory({
                userId: 'Guest',
                ipAddress,
                userAgent,
                attempt: 'FAILED',
            });
            return res.status(400).json({ message: 'User not found' });
        }
        // check password
        const isMatch = await bcryptjs_1.default.compare(parseBody.data.password, user.password);
        if (!isMatch) {
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: 'FAILED',
            });
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // check if user is verified
        if (!user.verified) {
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: 'FAILED',
            });
            return res.status(400).json({ message: 'User not verified' });
        }
        // check if user is active
        if (user.status !== 'ACTIVE') {
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: 'FAILED',
            });
            return res.status(400).json({ message: `Your account is not ${user.status.toLowerCase()}` });
        }
        // generate JWT token
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
        await createLoginHistory({
            userId: user.id,
            ipAddress,
            userAgent,
            attempt: 'SUCCESS',
        });
        return res.status(200).json({
            accessToken
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = userLogin;
