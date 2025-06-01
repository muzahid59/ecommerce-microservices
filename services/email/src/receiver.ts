import amqp from "amqplib";
import { QUEUE_SERVICE_URL } from "./config";
import { transporter, defaultSender } from "./config";
import { prisma } from "./prisma"; 
import { templateEngine } from './templates';

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

receiveFromQueue('send-email', async (message) => { 
  console.log(`Received message from queue 'send-email': ${message}`);
  const parsedBody = JSON.parse(message);
  
  // Extract data from message
  const { userEmail, id, grandTotal } = parsedBody.order;
  
  // Use template engine to generate email content
  const emailContent = templateEngine.render('orderConfirmation', {
    id,
    grandTotal
  });
  
  const from = defaultSender;
  const recipient = userEmail;
  
  // Create email options using template output
  const emailOptions = {
    from,
    to: recipient,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html, // HTML version if available
  };
  
  // send email using the transporter
  const { rejected } = await transporter.sendMail(emailOptions);
  if (rejected.length > 0) {
    console.log('Email rejected:', rejected);
  }
  console.log('Email sent successfully');
  
  // save email to the database
  const email = await prisma.email.create({
    data: {
      sender: from,
      recipient,
      subject: emailContent.subject,
      body: emailContent.text,
      source: 'Order Confirmation',
    }
  }); 
});