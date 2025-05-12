import { UserCreateSchema } from '@/schemas';
import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';

const createUser = async (req: Request, res: Response, next: NextFunction) => { 
  try {
    const parseBody = UserCreateSchema.safeParse(req.body);

    if (!parseBody.success) {
      return res.status(400).json({ message: parseBody.error.errors });
    }

    // check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { authUserId: parseBody.data.authUserId }
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create a new user
    const user = await prisma.user.create({
      data: parseBody.data,
    });

    // Return the created user
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export default createUser;