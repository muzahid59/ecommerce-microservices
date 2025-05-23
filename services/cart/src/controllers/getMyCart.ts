import { Request, Response, NextFunction } from 'express';
import redis from '@/redis';

const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartSessionId = req.headers['cart-session-id'] as string || null;
    if (!cartSessionId) { 
      return res.status(200).json({
        data: []
      });
    }
    
    // get cart items from redis
    const cart = await redis.hgetall(`cart:${cartSessionId}`);
    if (!cart) {
      return res.status(200).json({
        data: []
      });
    }
    return res.status(200).json({
      data: cart
    });
      
  } catch (error) {
    next(error);
  }
}

export default getMyCart;