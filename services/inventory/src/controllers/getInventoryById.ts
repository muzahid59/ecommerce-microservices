import {Request, Response, NextFunction} from 'express';
import prisma from '@/prisma';

const getInventoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // check if the invetory exists
    const { id } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: {
        id: id,
      },
      select: {
        quantity: true,
      }
    });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    return res.status(200).json(inventory);
  } catch (error) {
    next(error)
  }
}

export default getInventoryById;