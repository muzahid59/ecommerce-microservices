import { EmailTemplate, TemplateData, EmailContent } from './types';

class TemplateEngine {
  private templates: Map<string, EmailTemplate> = new Map();

  registerTemplate(name: string, template: EmailTemplate): void {
    this.templates.set(name, template);
  }

  getTemplate(name: string): EmailTemplate | undefined {
    return this.templates.get(name);
  }

  render(templateName: string, data: TemplateData): EmailContent {
    const template = this.templates.get(templateName);
    
    if (!template) {
      throw new Error(`Template "${templateName}" not found`);
    }

    const content: EmailContent = {
      subject: template.subject,
      text: template.generateText(data),
    };

    if (template.generateHtml) {
      content.html = template.generateHtml(data);
    }

    return content;
  }
}

export const templateEngine = new TemplateEngine();
