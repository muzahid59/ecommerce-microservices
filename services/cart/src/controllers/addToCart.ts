import { cartItemSchema } from '@/schemas';
import { Request, Response, NextFunction } from 'express';
import redis from '@/redis';
import { v4 as uuidv4 } from 'uuid';
import { CART_TTL } from '@/config';

const addToCart = async (req: Request, res: Response, next: NextFunction) => {  
  try {
    // validate request body
    const parseBody = cartItemSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({
        message: 'Invalid request body',
        errors: parseBody.error.errors,
      });
    }

    let cartSessionId = req.headers['cart-session-id'] as string || null;
    // check if cart session id exists and also live in redis
    if (cartSessionId) {
      const exists = await redis.exists(`session:${cartSessionId}`);
      console.log('exists', exists);
      if (!exists) {
        cartSessionId = null;
      }
    }
    if (!cartSessionId) {
      // create a new cart session id
      cartSessionId = uuidv4();
      console.log('New cart session id', cartSessionId);

      // set the cart session id in redis
      await redis.setex(`session:${cartSessionId}`, CART_TTL, cartSessionId);

      // set the cart session id in the response header
      res.setHeader('cart-session-id', cartSessionId);
    }

    // add item to cart
    await redis.hset(`cart:${cartSessionId}`, parseBody.data.productId, JSON.stringify({
      inventoryId: parseBody.data.inventoryId,
      quantity: parseBody.data.quantity,
    }));
    
    return res.status(200).json({
      message: 'Item added to cart',
    });
    // TODO: check if the inventory id exists in the inventory service
    // TODO: update the inventory service with the new cart item


  } catch (error) {
    next(error);
  }
}

export default addToCart;