import e, { Request, Response, NextFunction } from 'express';
import { prisma } from '@/prisma';
import { EmailVerificationShema } from '@/schemas'; 
import { STATUS_CODES } from 'http';
import axios from 'axios';
import { EMAIL_SERVICE_URL } from '../config';
import { text } from 'stream/consumers';

const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request body
    const parseBody = EmailVerificationShema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ errors: parseBody.error.errors });
    }
    // check if the user with email exists
    const userExists = await prisma.user.findUnique({
      where: { email: parseBody.data.email }
    })
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // find the verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: userExists.id,
        code: parseBody.data.code,
      }
    })
    if (!verificationCode) {
      return res.status(404).json({ message: 'Invalid verification code' });
    }
    // if the code has expired
    if (verificationCode.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }
    
    // update user status to verified
    await prisma.user.update({
      where: { id: userExists.id },
      data: { verified: true, status: 'ACTIVE' }
    });

    // update  verification code status to used
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { status: 'USED', verifiedAt: new Date() }
    });

    // send success mail
    await axios.post(`${EMAIL_SERVICE_URL}/emails/send`, {
      to: userExists.email,
      subject: 'Email Verified',
      text: 'Your email has been verified successfully',
      source: 'verify-email'
    });

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
}

export default verifyEmail;