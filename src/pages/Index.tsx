import { useState } from 'react';
import { PDFUpload } from '@/components/PDFUpload';
import { FieldEditor } from '@/components/FieldEditor';
import { PDFPreview } from '@/components/PDFPreview';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { DebugPanel } from '@/components/DebugPanel';
import { PDFProcessor } from '@/utils/pdfProcessor';
import { PDFField, PDFFormData, FormProgress } from '@/types/pdf';
import { toast } from 'sonner';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfData, setPdfData] = useState<PDFFormData | null>(null);
  const [fields, setFields] = useState<PDFField[]>([]);
  const [pdfProcessor] = useState(() => new PDFProcessor());

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      const data = await pdfProcessor.loadPDF(file);
      setPdfData(data);
      setFields(data.fields);
      setCurrentStep(2);
      
      toast.success("PDF loaded successfully", {
        description: `Found ${data.fillableFieldsCount} fillable fields`
      });
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error("Failed to load PDF", {
        description: "Please ensure the PDF is not corrupted and try again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldUpdate = (updatedFields: PDFField[]) => {
    setFields(updatedFields);
  };

  const handleNext = () => {
    setCurrentStep(3);
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  const getProgress = (): FormProgress => {
    const totalFields = fields.length;
    const completedFields = fields.filter(field => {
      if (field.type === 'checkbox') return true; // Checkboxes are always "complete"
      return field.value && field.value !== '';
    }).length;

    return {
      totalFields,
      completedFields,
      percentage: totalFields > 0 ? (completedFields / totalFields) * 100 : 0
    };
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            PDF Form Filler
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Securely fill out any PDF form with real field detection, manual editing, and instant download
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator progress={getProgress()} currentStep={currentStep} />
        </div>

        {/* Main Content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <PDFUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          )}

          {currentStep === 2 && pdfData && (
            <FieldEditor
              fields={fields}
              onFieldUpdate={handleFieldUpdate}
              onNext={handleNext}
            />
          )}

          {currentStep === 3 && pdfData && (
            <PDFPreview
              fields={fields}
              fileName={pdfData.fileName}
              pdfProcessor={pdfProcessor}
              onBack={handleBack}
            />
          )}
        </div>

        {/* Debug Panel */}
        {pdfData && (
          <DebugPanel
            fields={fields}
            fileName={pdfData.fileName}
            pageCount={pdfData.pageCount}
          />
        )}
      </div>
    </div>
  );
};

export default Index;