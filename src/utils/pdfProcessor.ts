import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFForm } from 'pdf-lib';
import { PDFField, PDFFormData } from '@/types/pdf';

export class PDFProcessor {
  private pdfDoc: PDFDocument | null = null;
  private form: PDFForm | null = null;

  async loadPDF(file: File): Promise<PDFFormData> {
    const arrayBuffer = await file.arrayBuffer();
    this.pdfDoc = await PDFDocument.load(arrayBuffer);
    this.form = this.pdfDoc.getForm();

    const fields = this.extractFields();
    
    return {
      fields,
      fileName: file.name,
      pageCount: this.pdfDoc.getPageCount(),
      fillableFieldsCount: fields.length
    };
  }

  private extractFields(): PDFField[] {
    if (!this.form) return [];

    const fields: PDFField[] = [];
    const formFields = this.form.getFields();

    formFields.forEach((field) => {
      const fieldName = field.getName();
      let fieldType: PDFField['type'] = 'text';
      let value: string | boolean = '';
      let options: string[] | undefined;

      // Determine field type and extract properties
      if (field instanceof PDFTextField) {
        fieldType = 'text';
        value = field.getText() || '';
        
        // Check if it might be a date field based on name
        if (this.isDateField(fieldName)) {
          fieldType = 'date';
        } else if (this.isNumberField(fieldName)) {
          fieldType = 'number';
        }
      } else if (field instanceof PDFCheckBox) {
        fieldType = 'checkbox';
        value = field.isChecked();
      } else if (field instanceof PDFDropdown) {
        fieldType = 'dropdown';
        value = field.getSelected()?.[0] || '';
        options = field.getOptions();
      } else if (field instanceof PDFRadioGroup) {
        fieldType = 'radio';
        value = field.getSelected() || '';
        options = field.getOptions();
      }

      fields.push({
        name: fieldName,
        type: fieldType,
        value,
        options,
        required: false, // PDF-lib doesn't expose required property easily
        placeholder: this.generatePlaceholder(fieldName, fieldType)
      });
    });

    return fields;
  }

  private isDateField(fieldName: string): boolean {
    const dateKeywords = ['date', 'birth', 'dob', 'expiry', 'expires', 'created', 'modified'];
    return dateKeywords.some(keyword => 
      fieldName.toLowerCase().includes(keyword)
    );
  }

  private isNumberField(fieldName: string): boolean {
    const numberKeywords = ['number', 'phone', 'zip', 'postal', 'amount', 'price', 'cost', 'age', 'year'];
    return numberKeywords.some(keyword => 
      fieldName.toLowerCase().includes(keyword)
    );
  }

  private generatePlaceholder(fieldName: string, fieldType: string): string {
    const name = fieldName.toLowerCase();
    
    if (fieldType === 'date') return 'MM/DD/YYYY';
    if (fieldType === 'number') return 'Enter number';
    
    if (name.includes('name')) return 'Enter your name';
    if (name.includes('email')) return 'Enter email address';
    if (name.includes('phone')) return 'Enter phone number';
    if (name.includes('address')) return 'Enter address';
    if (name.includes('city')) return 'Enter city';
    if (name.includes('state')) return 'Enter state';
    if (name.includes('zip')) return 'Enter ZIP code';
    
    return `Enter ${fieldName.replace(/[_-]/g, ' ').toLowerCase()}`;
  }

  async fillForm(fieldsData: PDFField[]): Promise<Uint8Array> {
    if (!this.form || !this.pdfDoc) {
      throw new Error('PDF not loaded');
    }

    // Fill each field with the provided data
    fieldsData.forEach((fieldData) => {
      try {
        const field = this.form!.getField(fieldData.name);
        
        if (field instanceof PDFTextField) {
          field.setText(fieldData.value as string);
        } else if (field instanceof PDFCheckBox) {
          if (fieldData.value) {
            field.check();
          } else {
            field.uncheck();
          }
        } else if (field instanceof PDFDropdown) {
          if (fieldData.value) {
            field.select(fieldData.value as string);
          }
        } else if (field instanceof PDFRadioGroup) {
          if (fieldData.value) {
            field.select(fieldData.value as string);
          }
        }
      } catch (error) {
        console.warn(`Failed to fill field "${fieldData.name}":`, error);
      }
    });

    // Flatten the form to make it non-editable (optional)
    // this.form.flatten();

    return await this.pdfDoc.save();
  }

  async generatePreviewUrl(fieldsData: PDFField[]): Promise<string> {
    const pdfBytes = await this.fillForm(fieldsData);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }

  downloadPDF(pdfBytes: Uint8Array, fileName: string): void {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.replace('.pdf', '_filled.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}