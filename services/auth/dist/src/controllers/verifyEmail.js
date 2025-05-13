"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("@/prisma");
const schemas_1 = require("@/schemas");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const verifyEmail = async (req, res, next) => {
    try {
        // validate request body
        const parseBody = schemas_1.EmailVerificationShema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({ errors: parseBody.error.errors });
        }
        // check if the user with email exists
        const userExists = await prisma_1.prisma.user.findUnique({
            where: { email: parseBody.data.email }
        });
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }
        // find the verification code
        const verificationCode = await prisma_1.prisma.verificationCode.findFirst({
            where: {
                userId: userExists.id,
                code: parseBody.data.code,
            }
        });
        if (!verificationCode) {
            return res.status(404).json({ message: 'Invalid verification code' });
        }
        // if the code has expired
        if (verificationCode.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Verification code expired' });
        }
        // update user status to verified
        await prisma_1.prisma.user.update({
            where: { id: userExists.id },
            data: { verified: true, status: 'ACTIVE' }
        });
        // update  verification code status to used
        await prisma_1.prisma.verificationCode.update({
            where: { id: verificationCode.id },
            data: { status: 'USED', verifiedAt: new Date() }
        });
        // send success mail
        await axios_1.default.post(`${config_1.EMAIL_SERVICE_URL}/emails/send`, {
            to: userExists.email,
            subject: 'Email Verified',
            text: 'Your email has been verified successfully',
            source: 'verify-email'
        });
        return res.status(200).json({ message: 'Email verified successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.default = verifyEmail;
