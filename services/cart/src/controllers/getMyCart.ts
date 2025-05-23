import { Request, Response, NextFunction } from 'express';
import redis from '@/redis';

const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartSessionId = req.headers['cart-session-id'] as string || null;
    if (!cartSessionId) { return res.status(200).json({ data: [] }); }
    
    // check if cart session id exists in redis
    const session = await redis.exists(`session:${cartSessionId}`);
    if (!session) {
      console.log('Cart session id does not exist');
      await redis.del(`cart:${cartSessionId}`);
      return res.status(200).json({
        data: []
      });
    }
    
    // get cart items from redis
    const items = await redis.hgetall(`cart:${cartSessionId}`);

    if (Object.keys(items).length === 0) {
      return res.status(200).json({
        data: []
      });
    }
    
    // format the cart items
    const formatttedItems = Object.keys(items).map(key => {
      const { inventoryId, quantity } = JSON.parse(items[key]) as { inventoryId: string, quantity: number };
      return {
        productId: key,
        inventoryId,
        quantity: quantity,
      };
    });

    return res.status(200).json({
      items: formatttedItems
    });
      
  } catch (error) {
    next(error);
  }
}

export default getMyCart;