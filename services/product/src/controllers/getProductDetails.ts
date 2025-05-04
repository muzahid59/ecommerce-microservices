import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';
import axios from 'axios';

const getProductDetails = async (req: Request, res: Response, next: NextFunction) => { 
    console.log("getProductDetails called");
    console.log('req.params:', req.params); // Add this line
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: {
                id: id,
            },
          });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        if (product.inventoryId === null) {
          /// create inventory record for the product
          console.log('Creating inventory record for product:', product.id);
          const {data: inventory} = await axios.post(
              `${process.env.INVENTORY_SERVICE_URL}/inventories`,
              {
                  productId: product.id,
                  sku: product.sku, 
              }
          );
          console.log('Inventory record created successfully:', inventory);
          // update product and store inventory id
          await prisma.product.update({
              where: {
                  id: product.id,
              },
              data: {
                  inventoryId: inventory.id,
              },
          });
          console.log('Product updated successfully with invertory id', inventory.id);

          return res.status(201).json({
              ...product,
              inventoryId: inventory.id,
              stock: inventory.stock || 0,
              stockStatus: inventory.stock > 0 ? 'in stock' : 'out of stock',
          });
        }
        // fetch inventory details
        const {data: inventory} = await axios.get(
            `${process.env.INVENTORY_SERVICE_URL}/inventories/${product.inventoryId}`
        );
        return res.status(200).json({
            ...product,
            inventoryId: product.inventoryId,
            stock: inventory.stock || 0,
            stockStatus: inventory.stock > 0 ? 'in stock' : 'out of stock',
        });
    } catch (error) {
        next(error);
    }
}
export default getProductDetails;
