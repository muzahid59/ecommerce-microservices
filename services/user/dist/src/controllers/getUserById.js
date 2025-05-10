"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("@/prisma");
// /users/:id?field=id|authUserId
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const field = req.query.field;
        const queryId = field === 'authUserId' ? 'authUserId' : 'id';
        // Find the user by ID
        const user = await prisma_1.prisma.user.findUnique({
            where: { queryId: id },
        });
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
