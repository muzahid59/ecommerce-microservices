import amqplib, { Channel, Connection } from 'amqplib';
import { RABBITMQ_URL, ORDER_EXCHANGE } from '../config';

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

      console.log('Connected to RabbitMQ');
      
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

  async publishMessage(exchange: string, routingKey: string, message: any): Promise<boolean> {
    if (!this.channel) {
      console.error('Cannot publish message: RabbitMQ channel not available');
      return false;
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      return this.channel.publish(exchange, routingKey, messageBuffer, {
        persistent: true,
        contentType: 'application/json'
      });
    } catch (error) {
      console.error('Error publishing message to RabbitMQ:', error);
      return false;
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
