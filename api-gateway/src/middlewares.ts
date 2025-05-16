import { NextFunction, Request, Response } from 'express';

const auth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers['authorization']) {
    return res.status(401).json({ messsage: 'Unauthorized' });
  }
  next();
}

const middlewares: any = { auth };
export default middlewares;