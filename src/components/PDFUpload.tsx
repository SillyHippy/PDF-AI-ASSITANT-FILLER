import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface PDFUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const PDFUpload = ({ onFileSelect, isLoading = false }: PDFUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast.error("Please upload a valid PDF file", {
        description: "Only PDF files are supported"
      });
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error("File too large", {
          description: "Please upload a PDF file smaller than 50MB"
        });
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isLoading
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="p-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300
            ${isDragActive && !isDragReject 
              ? 'border-primary bg-primary/5' 
              : isDragReject 
                ? 'border-destructive bg-destructive/5'
                : 'border-muted-foreground/30 hover:border-primary hover:bg-primary/5'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-6">
            <div className="flex justify-center">
              {isDragReject ? (
                <AlertCircle className="w-16 h-16 text-destructive" />
              ) : (
                <div className={`
                  p-4 rounded-full transition-colors
                  ${isDragActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                `}>
                  {isLoading ? (
                    <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                {isLoading 
                  ? 'Processing PDF...' 
                  : isDragActive 
                    ? 'Drop your PDF here' 
                    : 'Upload PDF Form'
                }
              </h3>
              
              {!isLoading && (
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Drag and drop your fillable PDF here, or click to browse
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>Supports fillable PDF forms • Max 50MB</span>
                  </div>
                </div>
              )}
            </div>

            {!isLoading && !isDragActive && (
              <Button variant="outline" className="mx-auto">
                Select PDF File
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">Security Notice</p>
              <p className="text-muted-foreground">
                Your PDF is processed locally in your browser. No data is sent to external servers or stored after download.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};