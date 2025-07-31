import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { PDFField } from '@/types/pdf';
import { toast } from 'sonner';

interface FieldEditorProps {
  fields: PDFField[];
  onFieldUpdate: (fields: PDFField[]) => void;
  onNext: () => void;
}

export const FieldEditor = ({ fields, onFieldUpdate, onNext }: FieldEditorProps) => {
  const [editingFields, setEditingFields] = useState<PDFField[]>(fields);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState<Partial<PDFField>>({
    name: '',
    type: 'text',
    value: '',
    required: false
  });

  const updateFieldValue = (index: number, value: string | boolean) => {
    const updated = [...editingFields];
    updated[index] = { ...updated[index], value };
    setEditingFields(updated);
    onFieldUpdate(updated);
  };

  const addCustomField = () => {
    if (!newField.name?.trim()) {
      toast.error("Field name is required");
      return;
    }

    if (editingFields.some(field => field.name === newField.name)) {
      toast.error("Field name already exists");
      return;
    }

    const field: PDFField = {
      name: newField.name,
      type: newField.type as PDFField['type'],
      value: newField.type === 'checkbox' ? false : '',
      required: newField.required || false,
      placeholder: `Enter ${newField.name?.replace(/[_-]/g, ' ').toLowerCase()}`
    };

    const updated = [...editingFields, field];
    setEditingFields(updated);
    onFieldUpdate(updated);
    
    setNewField({ name: '', type: 'text', value: '', required: false });
    setShowAddField(false);
    
    toast.success("Custom field added successfully");
  };

  const removeField = (index: number) => {
    const updated = editingFields.filter((_, i) => i !== index);
    setEditingFields(updated);
    onFieldUpdate(updated);
    toast.success("Field removed");
  };

  const getFieldTypeIcon = (type: PDFField['type']) => {
    switch (type) {
      case 'checkbox': return '☑️';
      case 'date': return '📅';
      case 'number': return '🔢';
      case 'dropdown': return '📋';
      case 'radio': return '◉';
      default: return '📝';
    }
  };

  const renderFieldInput = (field: PDFField, index: number) => {
    const fieldId = `field-${field.name}`;
    
    switch (field.type) {
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              name={field.name}
              checked={field.value as boolean}
              onCheckedChange={(checked) => updateFieldValue(index, checked as boolean)}
            />
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.name.replace(/[_-]/g, ' ')}
            </Label>
          </div>
        );

      case 'dropdown':
      case 'radio':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.name.replace(/[_-]/g, ' ')}
            </Label>
            <Select
              name={field.name}
              value={field.value as string}
              onValueChange={(value) => updateFieldValue(index, value)}
            >
              <SelectTrigger id={fieldId}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.name.replace(/[_-]/g, ' ')}
            </Label>
            <Input
              id={fieldId}
              name={field.name}
              type="text"
              value={field.value as string}
              onChange={(e) => updateFieldValue(index, e.target.value)}
              placeholder={field.placeholder || "MM/DD/YYYY or any date format"}
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.name.replace(/[_-]/g, ' ')}
            </Label>
            <Input
              id={fieldId}
              name={field.name}
              type="text"
              value={field.value as string}
              onChange={(e) => updateFieldValue(index, e.target.value)}
              placeholder={field.placeholder || "Enter numbers, letters, or both"}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.name.replace(/[_-]/g, ' ')}
            </Label>
            <Input
              id={fieldId}
              name={field.name}
              type="text"
              value={field.value as string}
              onChange={(e) => updateFieldValue(index, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
            />
          </div>
        );
    }
  };

  const completedFields = editingFields.filter(field => {
    if (field.type === 'checkbox') return true; // Checkboxes are always "complete"
    return field.value && field.value !== '';
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fill Form Fields</h2>
          <p className="text-muted-foreground">
            Complete {completedFields} of {editingFields.length} fields detected in your PDF
          </p>
        </div>
        <Button
          onClick={() => setShowAddField(!showAddField)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Custom Field
        </Button>
      </div>

      {/* Add Custom Field Form */}
      {showAddField && (
        <Card className="p-4 border-primary/20 bg-primary/5">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Add Custom Field</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="new-field-name">Field Name</Label>
                <Input
                  id="new-field-name"
                  placeholder="Enter field name"
                  value={newField.name || ''}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="new-field-type">Field Type</Label>
                <Select
                  value={newField.type}
                  onValueChange={(value) => setNewField({ ...newField, type: value as PDFField['type'] })}
                >
                  <SelectTrigger id="new-field-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={addCustomField} className="flex-1">
                  Add Field
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddField(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editingFields.map((field, index) => (
          <Card key={field.name} className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getFieldTypeIcon(field.type)}</span>
                <Badge variant="outline" className="text-xs">
                  {field.type}
                </Badge>
                {field.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              {!field.options && ( // Don't allow deletion of original PDF fields with options
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {renderFieldInput(field, index)}
          </Card>
        ))}
      </div>

      {editingFields.length === 0 && (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Fillable Fields Detected
          </h3>
          <p className="text-muted-foreground mb-4">
            This PDF doesn't contain any fillable form fields. You can add custom fields to map data to specific locations.
          </p>
          <Button onClick={() => setShowAddField(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Field
          </Button>
        </Card>
      )}

      {editingFields.length > 0 && (
        <div className="flex justify-end">
          <Button 
            onClick={onNext}
            className="bg-gradient-primary text-primary-foreground px-8"
          >
            Preview & Generate PDF
          </Button>
        </div>
      )}
    </div>
  );
};