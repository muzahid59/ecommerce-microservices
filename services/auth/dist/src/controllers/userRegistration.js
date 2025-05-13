"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("@/prisma");
const schemas_1 = require("@/schemas");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const generateVerificationCode = () => {
    // Generate a random 2-digit verification code
    const timestamp = new Date().getTime();
    const randoomNum = Math.floor(10 + Math.random() * 90).toString();
    let code = (timestamp + randoomNum).slice(-5);
    return code;
};
const userRegistration = async (req, res, next) => {
    try {
        // validate request body
        const parseBody = schemas_1.UserCreateSchema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({ errors: parseBody.error.errors });
        }
        // check if user already exists
        const userExists = await prisma_1.prisma.user.findUnique({
            where: { email: parseBody.data.email },
        });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(parseBody.data.password, salt);
        // Create the auth user
        const authUser = await prisma_1.prisma.user.create({
            data: {
                ...parseBody.data,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                verified: true,
            }
        });
        console.log('User created:', authUser);
        // create the user profile by calling the user service
        await axios_1.default.post(`${config_1.USER_SERVICE}/users`, {
            authUserId: authUser.id,
            name: authUser.name,
            email: authUser.email,
        });
        const code = generateVerificationCode();
        await prisma_1.prisma.verificationCode.create({
            data: {
                userid: authUser.id,
                code,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000 * 24), // 24 hour expiration
            }
        });
        // send verification email
        await axios_1.default.post(`${config_1.USER_SERVICE}/emails/send`, {
            recipient: authUser.email,
            subject: 'Email verification',
            body: `Your verification code is ${code}. It will expire in 24 hours.`,
            source: 'user-registration',
        });
        return res.status(201).json({
            authUser,
            message: 'User created successfully. Please check your email for verification code.',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.default = userRegistration;
