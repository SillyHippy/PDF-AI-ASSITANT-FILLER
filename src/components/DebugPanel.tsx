import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Bug, Copy } from 'lucide-react';
import { PDFField } from '@/types/pdf';
import { toast } from 'sonner';

interface DebugPanelProps {
  fields: PDFField[];
  fileName?: string;
  pageCount?: number;
}

export const DebugPanel = ({ fields, fileName, pageCount }: DebugPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = async () => {
    const debugData = {
      fileName,
      pageCount,
      fieldsDetected: fields.length,
      fields: fields.map(field => ({
        name: field.name,
        type: field.type,
        value: field.value,
        options: field.options,
        position: {
          x: field.x,
          y: field.y,
          width: field.width,
          height: field.height,
          page: field.page
        }
      }))
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
      toast.success("Debug data copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy debug data");
    }
  };

  const getFieldTypeColor = (type: PDFField['type']) => {
    switch (type) {
      case 'text': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'checkbox': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'date': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'number': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'dropdown': return 'bg-cyan-500/10 text-cyan-700 border-cyan-200';
      case 'radio': return 'bg-pink-500/10 text-pink-700 border-pink-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="border-dashed border-muted-foreground/30">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bug className="w-5 h-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-foreground">Debug Panel</h3>
              <p className="text-sm text-muted-foreground">
                Raw PDF field detection data for troubleshooting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Expand
                </>
              )}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">{fields.length}</div>
                <div className="text-sm text-muted-foreground">Fields Detected</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">{pageCount || 0}</div>
                <div className="text-sm text-muted-foreground">Pages</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {new Set(fields.map(f => f.type)).size}
                </div>
                <div className="text-sm text-muted-foreground">Field Types</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {fields.filter(f => f.options?.length).length}
                </div>
                <div className="text-sm text-muted-foreground">With Options</div>
              </div>
            </div>

            {/* Field Type Distribution */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Field Types</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(fields.map(f => f.type))).map(type => {
                  const count = fields.filter(f => f.type === type).length;
                  return (
                    <Badge 
                      key={type} 
                      className={getFieldTypeColor(type)}
                      variant="outline"
                    >
                      {type} ({count})
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Fields Table */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Detected Fields</h4>
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">Name</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Value</th>
                      <th className="text-left p-2 font-medium">Options</th>
                      <th className="text-left p-2 font-medium">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <tr key={field.name} className="border-t">
                        <td className="p-2 font-mono text-xs">
                          {field.name}
                        </td>
                        <td className="p-2">
                          <Badge 
                            className={getFieldTypeColor(field.type)}
                            variant="outline"
                          >
                            {field.type}
                          </Badge>
                        </td>
                        <td className="p-2 max-w-32 truncate">
                          {field.type === 'checkbox' 
                            ? (field.value ? 'checked' : 'unchecked')
                            : field.value || '—'
                          }
                        </td>
                        <td className="p-2">
                          {field.options?.length ? (
                            <Badge variant="secondary">
                              {field.options.length} options
                            </Badge>
                          ) : '—'}
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">
                          {field.page ? `Page ${field.page}` : '—'}
                          {field.x && field.y ? ` (${field.x}, ${field.y})` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bug className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No PDF fields detected. The PDF may not contain fillable form fields.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};