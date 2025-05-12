"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
// /users/:id?field=id|authUserId
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const field = req.query.field;
        const fieldName = field === 'authUserId' ? 'authUserId' : 'id';
        let where;
        if (fieldName === 'authUserId') {
            where = { authUserId: id };
        }
        else {
            where = { id: id };
        }
        // Find the user by ID
        const user = await prisma_1.default.user.findUnique({ where });
        // If user not found, return 404
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Return the user
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.default = getUserById;
