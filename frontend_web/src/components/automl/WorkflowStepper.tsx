import React from 'react';
import { WORKFLOW_STEPS, type WorkflowStep } from '@/types/automl';

interface WorkflowStepperProps {
  currentStep: WorkflowStep;
  onStepClick?: (step: WorkflowStep) => void;
  completedSteps?: WorkflowStep[];
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStep,
  onStepClick,
  completedSteps = [],
}) => {
  const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-gray-800 border-b border-gray-700">
      {WORKFLOW_STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.includes(step.id) || index < currentStepIndex;
        const isClickable = onStepClick && (isCompleted || index <= currentStepIndex + 1);

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${isActive
                  ? 'bg-[#81FBA5] text-gray-900'
                  : isCompleted
                    ? 'bg-gray-700 text-[#81FBA5]'
                    : 'bg-gray-700/50 text-gray-400'
                }
                ${isClickable ? 'hover:bg-gray-600 cursor-pointer' : 'cursor-default'}
              `}
            >
              <span className="flex items-center justify-center w-5 h-5 text-xs rounded-full bg-gray-900/30">
                {step.number}
              </span>
              <span className="hidden sm:inline">{step.icon}</span>
              <span>{step.label}</span>
            </button>
            {index < WORKFLOW_STEPS.length - 1 && (
              <div className={`w-4 h-0.5 ${isCompleted ? 'bg-[#81FBA5]' : 'bg-gray-600'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
