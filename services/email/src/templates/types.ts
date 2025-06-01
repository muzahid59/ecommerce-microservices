export interface EmailTemplate {
  subject: string;
  generateText(data: any): string;
  generateHtml?(data: any): string;
}

export interface TemplateData {
  [key: string]: any;
}

export interface EmailContent {
  subject: string;
  text: string;
  html?: string;
}
