import prisma from '@/prisma';
import { ProductUpdateDTOSchema } from '@/schemas';
import { Request, Response, NextFunction } from 'express';

const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  console.log('updateProduct');

  try {
    // parse the request body
    const parseBody = ProductUpdateDTOSchema.safeParse(req.body);
    if (!parseBody.success) { 
      return res.status(400).json({
        message: 'Invalid request body',
        errors: parseBody.error.errors,
      });
    }

    const { id } = req.params;

    // check if the product exists
    const product = prisma.product.findUnique({
      where: {
        id: id,
      },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // update the product
    const updatedProduct = await prisma.product.update({
      where: {
        id: req.params.id,
      },
      data: parseBody.data
    });
    return res.status(200).json(updatedProduct);   

  } catch (error) { 
    next(error);
  }
}

export default updateProduct;