import { EmailTemplate } from './types';

export const orderConfirmationTemplate: EmailTemplate = {
  subject: 'Order Confirmation',
  
  generateText(data: { id: string; grandTotal: number }): string {
    return `Thank you for your order! Your order ID is ${data.id}. The total amount is $${data.grandTotal.toFixed(2)}.`;
  },
  
  generateHtml(data: { id: string; grandTotal: number }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Order Confirmation</h1>
        <p>Thank you for your order!</p>
        <p><strong>Order ID:</strong> ${data.id}</p>
        <p><strong>Total Amount:</strong> $${data.grandTotal.toFixed(2)}</p>
        <p>We'll notify you when your order ships.</p>
      </div>
    `;
  }
};
