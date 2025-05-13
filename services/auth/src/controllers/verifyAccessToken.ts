import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/prisma';
import { AccessTokenSchema } from '@/schemas';
import jwt from 'jsonwebtoken';

const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request body
    const parseBody = AccessTokenSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ errors: parseBody.error.errors });
    }

    // check if access token is valid
    const { accessToken } = parseBody.data;
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET as string);
    const user = await prisma.user.findUnique({
      where: { id: (decodedToken as any).id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    return res.status(200).json({ message: 'Authorized', user });
  } catch (error) {
    next(error);
  }
}

export default verifyAccessToken;