import { CartItemSchema, OrderCreateSchema } from '@/schemas';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { CART_SERVICE_URL, EMAIL_SERVICE_URL, PRODUCT_SERVICE_URL } from '@/config'
import { z } from 'zod';
import prisma from '@/prisma';
import sendToQueue from '@/queue';

const checkout = async (req: Request, res: Response, next: NextFunction) => {  
    try {
      // validate the request body
      const parsedBody = OrderCreateSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({
          message: 'Invalid request body',
          errors: parsedBody.error.errors,
        });
      }
      const { data: cartData } = await axios.get(`${CART_SERVICE_URL}/cart/get-my-cart`, {
        headers: {
          'cart-session-id': parsedBody.data.cartSessionId,
        }
      });

      const cartItems = z.array(CartItemSchema).safeParse(cartData.items);
      if (!cartItems.success) {
        return res.status(400).json({
          message: 'Invalid cart items',
          errors: cartItems.error.errors,
        });
      }
      
      if (cartItems.data.length === 0) {
        return res.status(400).json({
          message: 'Cart is empty',
        }); 
      }
      
      const productDetails = await Promise.all(cartItems.data.map(async (item) => { 
          const { data: product } = await axios.get(`${PRODUCT_SERVICE_URL}/products/${item.productId}`);
          return {
            productId: product.id as string,
            productName: product.name as string,
            sku: product.sku as string,
            price: product.price as number,
            quantity: item.quantity as number,
            total: product.price * item.quantity as number,
          };    
        }
      ));
      const subtotal = productDetails.reduce((acc, item) => acc + item.total, 0);
      // Handle tax calculation later
      const tax = 0; 
      const grandTotal = subtotal + tax;

      // create order
      const order = await prisma.order.create({
        data: {
          userId: parsedBody.data.userId,
          userName: parsedBody.data.userName,
          userEmail: parsedBody.data.userEmail,
          subtotal,
          tax,
          grandTotal,
          orderItems: {
            create: productDetails.map(item => ({
              ...item
            })),
          },
        },
      });
      console.log('Order created:', order);
      // // clear the cart
      // await axios.post(`${CART_SERVICE_URL}/cart/clear-cart`, {
      //   headers: {
      //     'cart-session-id': parsedBody.data.cartSessionId,
      //   }
      // });

      // // send email
      // await axios.post(`${EMAIL_SERVICE_URL}/emails/send`, {
      //   recipient: parsedBody.data.userEmail,
      //   subject: 'Order Confirmation',
      //   body: `Thank you for your order! Your order ID is ${order.id}. The total amount is $${grandTotal.toFixed(2)}.`,
      //   source: 'Checkout'
      // });

      // publish send mail event
      sendToQueue('send-email', JSON.stringify({order}));
      // publish clear cart event
      sendToQueue('clear-cart', JSON.stringify({'cartSessionId': parsedBody.data.cartSessionId}));

      return res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        next(error);
    } 
}

export default checkout;