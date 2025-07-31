import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, ArrowLeft, CheckCircle } from 'lucide-react';
import { PDFField } from '@/types/pdf';
import { PDFProcessor } from '@/utils/pdfProcessor';
import { toast } from 'sonner';

interface PDFPreviewProps {
  fields: PDFField[];
  fileName: string;
  pdfProcessor: PDFProcessor;
  onBack: () => void;
}

export const PDFPreview = ({ fields, fileName, pdfProcessor, onBack }: PDFPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    generatePreview();
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [fields]);

  const generatePreview = async () => {
    try {
      setIsGenerating(true);
      const url = await pdfProcessor.generatePreviewUrl(fields);
      setPreviewUrl(url);
      toast.success("Preview generated successfully");
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error("Failed to generate preview");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const pdfBytes = await pdfProcessor.fillForm(fields);
      pdfProcessor.downloadPDF(pdfBytes, fileName);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const filledFields = fields.filter(field => {
    if (field.type === 'checkbox') return field.value === true;
    return field.value && field.value !== '';
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Edit
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Preview & Download</h2>
            <p className="text-muted-foreground">
              Review your filled form and download the completed PDF
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Preview */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5" />
                PDF Preview
              </h3>
              <Button 
                onClick={generatePreview} 
                variant="outline" 
                size="sm"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Refresh Preview'}
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden bg-muted">
              {isGenerating ? (
                <div className="flex items-center justify-center h-96 bg-muted">
                  <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Generating preview...</p>
                  </div>
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-96 lg:h-[600px]"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-muted">
                  <p className="text-muted-foreground">Preview not available</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Summary & Actions */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Form Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">File:</span>
                <span className="text-sm font-medium">{fileName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Fields:</span>
                <Badge variant="outline">{fields.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Filled Fields:</span>
                <Badge variant={filledFields === fields.length ? "default" : "secondary"}>
                  {filledFields}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completion:</span>
                <Badge variant={filledFields === fields.length ? "default" : "secondary"}>
                  {Math.round((filledFields / fields.length) * 100)}%
                </Badge>
              </div>
            </div>
          </Card>

          {/* Actions Card */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full bg-gradient-primary text-primary-foreground flex items-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Submit & Download PDF
                  </>
                )}
              </Button>
              
              {filledFields === fields.length && (
                <div className="flex items-center gap-2 text-sm text-success mt-2">
                  <CheckCircle className="w-4 h-4" />
                  All fields completed
                </div>
              )}
            </div>
          </Card>

          {/* Field List */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Field Values</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.name} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground truncate flex-1 mr-2">
                    {field.name.replace(/[_-]/g, ' ')}
                  </span>
                  <span className="font-medium text-right">
                    {field.type === 'checkbox' 
                      ? (field.value ? '✓' : '✗')
                      : field.value || '—'
                    }
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};