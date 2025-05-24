import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';
const getOrders = async (req: Request, res: Response, next: NextFunction) => { 
  try {
    // Fetch all orders from the database
    const orders = await prisma.order.findMany({});
    // Return the orders in the response
    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
}

export default getOrders;
