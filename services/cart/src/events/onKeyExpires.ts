import { Redis } from 'ioredis'
import { REDIS_HOST, REDIS_PORT } from '@/config'
import { clearCart } from '../services'


const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT
});

const CHANNEL_KEY = '__keyevent@0__:expired';
redis.config('SET', 'notify-keyspace-events', 'Ex');
redis.subscribe(CHANNEL_KEY);

redis.on('message', async (channel, message) => {
  if (channel === CHANNEL_KEY) {
    console.log(`Key expired: ${message}`);
    const cartKey = message.split(':')[1];
    if (cartKey) {
      console.log(`Cart session expired: ${cartKey}`);
      // Call the clearCart function to clear the cart
      await clearCart(cartKey);
    }
    // Optionally, you can also delete the session key if needed
  }
});

