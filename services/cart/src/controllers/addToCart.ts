import { cartItemSchema } from '@/schemas';
import { Request, Response, NextFunction } from 'express';
import redis from '@/redis';
import { v4 as uuidv4 } from 'uuid';
import { CART_TTL } from '@/config';
import axios from 'axios';

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

    // check if the product id exists in the inventory service
    const data  = await axios.get(`${process.env.INVENTORY_SERVICE_URL}/inventories/${parseBody.data.inventoryId}`)
    if (!data) {
      return res.status(404).json({
        message: 'Inventory not found',
      });
    } 
    
    if (Number(data.data.quantity) < parseBody.data.quantity) {
      return res.status(400).json({
        message: 'Not enough inventory',
      });
    }

    // add item to cart
    const cartItem = await redis.hget(`cart:${cartSessionId}`, parseBody.data.productId);
    let itemQuanity = parseBody.data.quantity;
    if (cartItem) {
      const { inventoryId, quantity } = JSON.parse(cartItem) as { inventoryId: string, quantity: number };
      itemQuanity += quantity
    } 
    await redis.hset(`cart:${cartSessionId}`, parseBody.data.productId, JSON.stringify({
      inventoryId: parseBody.data.inventoryId,
      quantity: itemQuanity,
    }));
    
    // Update the inventory service with the new cart item
    await axios.put(`${process.env.INVENTORY_SERVICE_URL}/inventories/${parseBody.data.inventoryId}`, {
      quantity: parseBody.data.quantity,
      actionType: 'OUT',
    });

    return res.status(200).json({
      message: 'Item added to cart',
      cartSessionId
    });
  } catch (error) {
    next(error);
  }
}

export default addToCart;