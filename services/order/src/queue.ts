import amqp from "amqplib";
import { QUEUE_SERVICE_URL } from "./config";

const sendToQueue = async (queue: string, message: any) => {
  const connection = await amqp.connect(QUEUE_SERVICE_URL);
  const channel = await connection.createChannel();
  const exchange = "order_exchange";
  await channel.assertExchange(exchange, "direct", { durable: true });

  channel.publish(exchange, queue, Buffer.from(message));
  console.log(`Message sent to queue ${queue}:`, message);

  setTimeout(() => {
    connection.close();
  }, 500);
}

export default sendToQueue;
