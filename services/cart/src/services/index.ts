import redis from "@/redis";
import axios from "axios";

export const clearCart = async (id: string) => {
  try {
    const data = await redis.hgetall(`cart:${id}`);
    if (Object.keys(data).length === 0) {
      console.log('Cart is already empty');
      return;
    }
    const items = Object.keys(data).map(key => {
      const { inventoryId, quantity } = JSON.parse(data[key]) as { inventoryId: string, quantity: number };
      return {
        productId: key,
        inventoryId,
        quantity,
      };
    });

    // Update the inventory service with the new cart item
    const requests = items.map(item => {  
      return axios.put(`${process.env.INVENTORY_SERVICE_URL}/inventories/${item.inventoryId}`, {
        quantity: item.quantity,
        actionType: 'IN',
      });
    });
    Promise.all(requests);
    console.log('Inventory updated successfully');
    // clear the cart
    await redis.del(`cart:${id}`);
    console.log('Cart cleared successfully');
  } catch (error) {
    console.log('Error clearing cart', error);
  }
}