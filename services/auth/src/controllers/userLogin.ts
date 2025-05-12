import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/prisma';
import { LoginAttempt } from '../../generated/prisma';
import { UserLoginSchema } from '@/schemas';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


type LoginHistory = {
  userId: string;
  ipAddress: string | undefined;
  userAgent: string | undefined;
  attempt: LoginAttempt;
}

const createLoginHistory = async (info: LoginHistory) => {
  await prisma.loginHistory.create({
    data: {
      userId: info.userId,
      ipAddress: info.ipAddress,
      userAgent: info.userAgent,
      attempt: info.attempt 
    }
  });
}

const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] as string || req.ip || '';
    const userAgent = req.headers['user-agent'] || '';

    // validate request body
    const parseBody = UserLoginSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ errors: parseBody.error.errors });
    }

    // check if user exists
    const user = await prisma.user.findUnique({
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
    const isMatch = await bcrypt.compare(parseBody.data.password, user.password);
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
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '2h' }
    );

     await createLoginHistory({
        userId: user.id,
        ipAddress,
        userAgent,
        attempt: 'SUCCESS',
      });

    return res.status(200).json({ 
      accessToken
    });
  
  } catch (error) {
    next(error);
  }
};

export default userLogin;