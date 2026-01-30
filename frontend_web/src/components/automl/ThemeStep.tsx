import React, { useState, useMemo } from 'react';
import { INDUSTRIES, type Industry, type UseCase, type ThemeDefinition } from '@/types/automl';
import { IndustrySelector } from './IndustrySelector';
import { UseCaseSelector } from './UseCaseSelector';
import { ThemeDefinitionForm } from './ThemeDefinitionForm';

interface ThemeStepProps {
  themeDefinition: ThemeDefinition | null;
  onUpdateTheme: (theme: Partial<ThemeDefinition>) => void;
  onComplete: () => void;
}

type SubStep = 'industry' | 'usecase' | 'form';

export const ThemeStep: React.FC<ThemeStepProps> = ({
  themeDefinition,
  onUpdateTheme,
  onComplete,
}) => {
  const [subStep, setSubStep] = useState<SubStep>(() => {
    if (themeDefinition?.industry && themeDefinition?.useCase) {
      return 'form';
    }
    if (themeDefinition?.industry) {
      return 'usecase';
    }
    return 'industry';
  });

  const selectedIndustry = useMemo(() => {
    if (!themeDefinition?.industry) return null;
    return INDUSTRIES.find(i => i.id === themeDefinition.industry) || null;
  }, [themeDefinition?.industry]);

  const handleIndustrySelect = (industry: Industry) => {
    console.log('[ThemeStep] Industry selected:', industry);
    onUpdateTheme({
      industry: industry.id,
      industryName: industry.name,
    });
    setSubStep('usecase');
  };

  const handleUseCaseSelect = (useCase: UseCase) => {
    onUpdateTheme({
      useCase: useCase.id,
      useCaseName: useCase.name,
      targetType: useCase.target_type,
      title: `${selectedIndustry?.name} - ${useCase.name}`,
    });
    setSubStep('form');
  };

  const handleBackToIndustry = () => {
    onUpdateTheme({
      industry: '',
      industryName: '',
      useCase: '',
      useCaseName: '',
    });
    setSubStep('industry');
  };

  const handleBackToUseCase = () => {
    setSubStep('usecase');
  };

  const handleFormSave = (data: ThemeDefinition) => {
    onUpdateTheme(data);
  };

  switch (subStep) {
    case 'industry':
      return (
        <IndustrySelector
          selectedIndustry={themeDefinition?.industry || null}
          onSelect={handleIndustrySelect}
        />
      );

    case 'usecase':
      if (!selectedIndustry) {
        setSubStep('industry');
        return null;
      }
      return (
        <UseCaseSelector
          industry={selectedIndustry}
          selectedUseCase={themeDefinition?.useCase || null}
          onSelect={handleUseCaseSelect}
          onBack={handleBackToIndustry}
        />
      );

    case 'form':
      if (!themeDefinition) {
        setSubStep('industry');
        return null;
      }
      return (
        <ThemeDefinitionForm
          initialData={themeDefinition}
          onSave={handleFormSave}
          onBack={handleBackToUseCase}
          onNext={onComplete}
        />
      );

    default:
      return null;
  }
};
