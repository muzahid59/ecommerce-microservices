import amqp from "amqplib";
import { QUEUE_SERVICE_URL } from "./config";
import redis from "./redis";

const receiveFromQueue = async (queue: string, callBack: (message: string) => void) => {
  const connection = await amqp.connect(QUEUE_SERVICE_URL);
  const channel = await connection.createChannel();
  const exchange = "order_exchange";
  await channel.assertExchange(exchange, "direct", { durable: true }); 

  const q  = await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(q.queue, exchange, queue);

  channel.consume(q.queue, (msg) => {
    if (msg) {
      callBack(msg.content.toString());
    }
  }, {noAck: true});
}

receiveFromQueue('clear-cart', (message) => { 
  const cartSessionId = JSON.parse(message).cartSessionId;
  redis.del(`cart:${cartSessionId}`);
  redis.del(`session:${cartSessionId}`);
  console.log(`Received message from queue 'clear-cart': ${message}`);
});