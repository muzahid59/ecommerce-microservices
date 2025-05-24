import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';

const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the order ID from the request parameters
    const { id } = req.params;

    // Fetch the order by ID from the database
    const order = await prisma.order.findUnique({
      where: {
        id: id,
      },
      include: {
        orderItems: true, // Include related items if needed
      },
    });

    // If the order does not exist, return a 404 error
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Return the order in the response
    return res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

export default getOrderById;