import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/prisma';
import { UserCreateSchema } from '@/schemas';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { USER_SERVICE } from '../config';

const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request body
    const parseBody = UserCreateSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ errors: parseBody.error.errors });
    }

    // check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email: parseBody.data.email },
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parseBody.data.password, salt);
    
    // Create the auth user
    const authUser = await prisma.user.create({
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
    await axios.post(`${USER_SERVICE}/users`, {
      authUserId: authUser.id,
      name: authUser.name,
      email: authUser.email,
    });

    // TODO: verification code generation
    // TODO: send verification email


    return res.status(201).json({authUser});
  } catch (err) {     
    next(err);
  }
      
}

export default userRegistration;