import { z } from 'zod';

export const OrderCreateSchema = z.object({
    userId: z.string(),
    userName: z.string(),
    userEmail: z.string().email(),
    cartSessionId: z.string()
});

export const CartItemSchema = z.object({
    productId: z.string(),
    inventoryId: z.string(),
    quantity: z.number().min(1)
});
