import dotenv from 'dotenv';

dotenv.config(
  {
    path: './.env',
  }
);

export const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4000'
export const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:4001'
export const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:4004'
export const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:4005'
export const QUEUE_SERVICE_URL = process.env.QUEUE_SERVICE_URL || 'amqp://localhost'

