import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, FileText } from "lucide-react";
import { FormProgress } from "@/types/pdf";

interface ProgressIndicatorProps {
  progress: FormProgress;
  currentStep: number;
}

const steps = [
  { id: 1, name: "Upload PDF", icon: FileText },
  { id: 2, name: "Fill Fields", icon: Circle },
  { id: 3, name: "Preview & Download", icon: CheckCircle }
];

export const ProgressIndicator = ({ progress, currentStep }: ProgressIndicatorProps) => {
  return (
    <div className="w-full space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                ${isCompleted 
                  ? 'bg-success border-success text-success-foreground' 
                  : isCurrent 
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                }
              `}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`
                mt-2 text-sm font-medium transition-colors
                ${isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'}
              `}>
                {step.name}
              </span>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`
                  absolute h-0.5 w-full top-5 left-1/2 -z-10 transition-colors
                  ${isCompleted ? 'bg-success' : 'bg-muted'}
                `} 
                style={{
                  width: `calc(100% / ${steps.length} - 2.5rem)`,
                  marginLeft: '2.5rem'
                }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Field Progress */}
      {progress.totalFields > 0 && currentStep >= 2 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-foreground">
              Fields Completed
            </span>
            <span className="text-muted-foreground">
              {progress.completedFields} of {progress.totalFields}
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <div className="text-xs text-muted-foreground text-center">
            {progress.percentage.toFixed(0)}% Complete
          </div>
        </div>
      )}
    </div>
  );
};