import zod  from "zod";

export const cartItemSchema = zod.object({
  inventoryId: zod.string(),
  productId: zod.string(),
  quantity: zod.number().min(1),
});