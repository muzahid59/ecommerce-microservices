import {Request, Response, NextFunction} from 'express';
import prisma from '@/prisma';
import { InventoryUpdateDTOSchema } from '@/schemas';

const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // check if the invetory exists
    const { id } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: {
        id: id,
      },
    });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    // validate the request body
    const parsedBody = InventoryUpdateDTOSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });  
    }
    // find the last history
    const lastHistory = await prisma.history.findFirst({
      where: {
        inventoryId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });
    // calculate the new quantity
    const newQuantity = parsedBody.data.actionType === 'IN' ?
      inventory.quantity + parsedBody.data.quantity :
      inventory.quantity - parsedBody.data.quantity;
    
      // update the inventory
    const updatedInventory = await prisma.inventory.update({
      where: {
        id: id,
      },
      data: {
        quantity: newQuantity,
        histories: {
          create: {
            actionType: parsedBody.data.actionType,
            quantityChanged: parsedBody.data.quantity,
            lastQuantity: lastHistory?.newQuantity || 0,
            newQuantity: newQuantity,
          }
        }
      },
      select: {
        id: true,
        quantity: true,
      }
    });
    
    return res.status(200).json(updatedInventory);
  } catch (error) {
    next(error)
  }
}

export default updateInventory;