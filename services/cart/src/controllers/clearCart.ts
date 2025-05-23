import { Request, Response, NextFunction } from 'express';
import redis from '@/redis';

const clearCart = async (req: Request, res: Response, next: NextFunction) => {  
  try {
    const cartSessionId = req.headers['cart-session-id'] as string || null;
    if (!cartSessionId) {
       return res.status(200).json({ message: 'Cart is empty'});
    }
    
    // check if cart session id exists in redis
    const exist = await redis.exists(`session:${cartSessionId}`);
    if (!exist) {
      delete req.headers['cart-session-id'];
      console.log('Cart session id does not exist');
      return res.status(200).json({
        messsage: 'Cart is empty'
      });
    }
    
    // clear the cart
    
    await redis.del(`cart:${cartSessionId}`);
    await redis.del(`session:${cartSessionId}`);

    delete req.headers['cart-session-id'];

    return res.status(200).json({
      message: 'Cart cleared successfully'
    });
      
  } catch (error) {
    next(error);
  }
}

export default clearCart;