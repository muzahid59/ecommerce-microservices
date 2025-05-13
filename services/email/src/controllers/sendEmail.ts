import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/prisma';
import { EmailCreateSchema } from '@/schemas';
import { transporter, defaultSender } from '../config';

const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // parse and validate the request body
    const parsedBody = EmailCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }

    // create email options
    const { recipient, subject, body, source, sender } = parsedBody.data;
    const from = sender || defaultSender;
    const emailOptions = {
      from,
      to: recipient,
      subject,
      text: body,
    }
    // send email using the transporter
    const { rejected } = await transporter.sendMail(emailOptions);
    if (rejected.length > 0) {
      console.log('Email rejected:', rejected);
      return res.status(500).json({ messsage: 'Failed to send email' });
    }
    // save email to the database
    const email = await prisma.email.create({
      data: {
        sender: from,
        recipient,
        subject,
        body,
        source,
      }
    }); 

    return res.status(200).json({
      message: 'Email sent successfully',
    });
  } catch (error) {
    next(error);
  }
}

export default sendEmail;