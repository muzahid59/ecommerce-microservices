import amqp from "amqplib";
import { QUEUE_SERVICE_URL } from "./config";

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

receiveFromQueue('send-email', (message) => { 
  console.log(`Received message from queue 'send-email': ${message}`);
});