import React from 'react';
import type { Industry, UseCase } from '@/types/automl';

interface UseCaseSelectorProps {
  industry: Industry;
  selectedUseCase: string | null;
  onSelect: (useCase: UseCase) => void;
  onBack: () => void;
}

export const UseCaseSelector: React.FC<UseCaseSelectorProps> = ({
  industry,
  selectedUseCase,
  onSelect,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 text-sm bg-gray-700 rounded-full text-[#81FBA5]">
          ステップ 1/7
        </span>
        <h2 className="text-2xl font-bold text-white">
          {industry.emoji} {industry.name}のユースケース
        </h2>
        <p className="text-gray-400">
          取り組みたいユースケースを選択してください
        </p>
      </div>

      <div className="space-y-3">
        {industry.use_cases.map(useCase => (
          <button
            key={useCase.id}
            onClick={() => onSelect(useCase)}
            className={`
              w-full flex items-start gap-4 p-4 rounded-lg border transition-all text-left
              ${selectedUseCase === useCase.id
                ? 'bg-[#81FBA5]/10 border-[#81FBA5]'
                : 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-700'
              }
            `}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{useCase.name}</span>
                <span className={`
                  px-2 py-0.5 text-xs rounded-full
                  ${useCase.target_type === 'binary' ? 'bg-blue-500/20 text-blue-300' :
                    useCase.target_type === 'regression' ? 'bg-green-500/20 text-green-300' :
                    'bg-purple-500/20 text-purple-300'}
                `}>
                  {useCase.target_type === 'binary' ? '二値分類' :
                   useCase.target_type === 'regression' ? '回帰' : '多クラス分類'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{useCase.description}</p>
            </div>
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
              ${selectedUseCase === useCase.id
                ? 'border-[#81FBA5] bg-[#81FBA5]'
                : 'border-gray-500'}
            `}>
              {selectedUseCase === useCase.id && (
                <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          業界選択に戻る
        </button>
      </div>
    </div>
  );
};
