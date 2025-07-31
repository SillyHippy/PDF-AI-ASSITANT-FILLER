export interface PDFField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'signature' | 'date' | 'number';
  value: string | boolean;
  required?: boolean;
  options?: string[]; // For dropdown/radio fields
  placeholder?: string;
  maxLength?: number;
  page?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface PDFFormData {
  fields: PDFField[];
  fileName: string;
  pageCount: number;
  fillableFieldsCount: number;
}

export interface FormProgress {
  totalFields: number;
  completedFields: number;
  percentage: number;
}