import amqplib, { Channel, Connection } from 'amqplib';
import { RABBITMQ_URL, ORDER_EXCHANGE, CART_QUEUE, ORDER_CREATED_ROUTING_KEY } from '../config';
import { clearCart } from '../services';

// Singleton to manage RabbitMQ connection
class RabbitMQClient {
  private static instance: RabbitMQClient;
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  private constructor() {}

  public static getInstance(): RabbitMQClient {
    if (!RabbitMQClient.instance) {
      RabbitMQClient.instance = new RabbitMQClient();
    }
    return RabbitMQClient.instance;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqplib.connect(RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // Declare the exchange
      await this.channel.assertExchange(ORDER_EXCHANGE, 'topic', { durable: true });
      
      // Declare the queue
      await this.channel.assertQueue(CART_QUEUE, { durable: true });
      
      // Bind the queue to the exchange with a specific routing key
      await this.channel.bindQueue(CART_QUEUE, ORDER_EXCHANGE, ORDER_CREATED_ROUTING_KEY);

      // Set up a consumer to process messages
      await this.consumeMessages();

      console.log('Cart service connected to RabbitMQ');
      
      // Handle connection errors and closure
      this.connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
        this.reconnect();
      });
      
      this.connection.on('close', () => {
        console.error('RabbitMQ connection closed');
        this.reconnect();
      });
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      // Try to reconnect after a delay
      setTimeout(() => this.reconnect(), 5000);
    }
  }

  private async reconnect(): Promise<void> {
    this.connection = null;
    this.channel = null;
    console.log('Trying to reconnect to RabbitMQ...');
    await this.connect();
  }

  private async consumeMessages(): Promise<void> {
    if (!this.channel) {
      console.error('Cannot consume messages: RabbitMQ channel not available');
      return;
    }

    try {
      await this.channel.consume(CART_QUEUE, async (message) => {
        if (!message) return;

        try {
          const content = JSON.parse(message.content.toString());
          console.log('Received message in cart service:', content);

          if (content.cartSessionId) {
            // Process the message - clear the cart
            await clearCart(content.cartSessionId);
            console.log(`Cart cleared via message broker for session ${content.cartSessionId}`);
          } else {
            console.warn('Received message without cartSessionId');
          }

          // Acknowledge the message - it will be removed from the queue
          this.channel?.ack(message);
        } catch (error) {
          console.error('Error processing message:', error);
          // Reject the message and don't requeue it if it's malformed
          this.channel?.reject(message, false);
        }
      });
    } catch (error) {
      console.error('Error setting up message consumer:', error);
    }
  }

  async closeConnection(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('Closed RabbitMQ connection');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }
}

export default RabbitMQClient;
