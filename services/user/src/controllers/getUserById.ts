import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/prisma';

// /users/:id?field=id|authUserId
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const field = req.query.field as string;
    const queryId = field === 'authUserId' ? 'authUserId' : 'id';

    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { queryId : id },
    });

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
export default getUserById;