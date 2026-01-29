import React from 'react';
import { INDUSTRIES, type Industry } from '@/types/automl';

interface IndustrySelectorProps {
  selectedIndustry: string | null;
  onSelect: (industry: Industry) => void;
}

export const IndustrySelector: React.FC<IndustrySelectorProps> = ({
  selectedIndustry,
  onSelect,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 text-sm bg-gray-700 rounded-full text-[#81FBA5]">
          ステップ 1/7
        </span>
        <h2 className="text-2xl font-bold text-white">テーマ定義</h2>
        <p className="text-gray-400">
          AI活用テーマを明確にして、プロジェクトの成功確率を高めましょう
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white text-center">どの業界ですか？</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {INDUSTRIES.map(industry => (
            <button
              key={industry.id}
              onClick={() => onSelect(industry)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-lg border transition-all
                ${selectedIndustry === industry.id
                  ? 'bg-[#81FBA5]/10 border-[#81FBA5] text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                }
              `}
            >
              <span className="text-3xl">{industry.emoji}</span>
              <span className="text-sm font-medium">{industry.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
