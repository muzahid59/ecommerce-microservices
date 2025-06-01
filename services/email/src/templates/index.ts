import { templateEngine } from './templateEngine';
import { orderConfirmationTemplate } from './orderConfirmation';

// Register all templates
templateEngine.registerTemplate('orderConfirmation', orderConfirmationTemplate);

export { templateEngine };
export * from './types';
