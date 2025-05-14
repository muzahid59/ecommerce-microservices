import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';
import { Prisma } from '../../generated/prisma';

// /users/:id?field=id|authUserId
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const field = req.query.field;
        const fieldName: string = field === 'authUserId' ? 'authUserId' : 'id';
        let where: Prisma.UserWhereUniqueInput
        if (fieldName === 'authUserId') {
            where = { authUserId: id };
        } else {
            where = { id: id };
        }

        // Find the user by ID
        const user = await prisma.user.findUnique({ where });
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

export default getUserById;
