import React, { useState } from 'react';
import type { ThemeDefinition } from '@/types/automl';
import { FileUploadWidget } from './FileUploadWidget';
import { Download, Database, Sparkles } from 'lucide-react';

interface DataStepProps {
  themeDefinition: ThemeDefinition | null;
  uploadedFileName: string | null;
  onFileUpload: (file: File) => Promise<void>;
  onGenerateSampleData: () => void;
  onNext: () => void;
  onBack: () => void;
}

// サンプルデータ生成（実際にはエージェントが生成）
const SAMPLE_DATA_TEMPLATES: Record<string, { columns: string[]; description: string }> = {
  churn: {
    columns: ['customer_id', 'age', 'tenure_months', 'monthly_charges', 'total_charges', 'contract_type', 'payment_method', 'num_support_tickets', 'last_purchase_days', 'churned'],
    description: '顧客離反予測用のサンプルデータ。顧客属性、利用状況、サポート履歴などを含みます。',
  },
  demand: {
    columns: ['date', 'product_id', 'store_id', 'price', 'promotion', 'day_of_week', 'is_holiday', 'weather', 'temperature', 'sales_quantity'],
    description: '需要予測用のサンプルデータ。日付、商品、店舗、プロモーション情報などを含みます。',
  },
  fraud: {
    columns: ['transaction_id', 'amount', 'merchant_category', 'transaction_time', 'distance_from_home', 'ratio_to_median', 'is_weekend', 'is_foreign', 'is_fraud'],
    description: '不正検知用のサンプルデータ。取引金額、加盟店情報、位置情報などを含みます。',
  },
  quality: {
    columns: ['batch_id', 'temperature', 'pressure', 'humidity', 'speed', 'material_type', 'operator_id', 'shift', 'machine_age', 'is_defective'],
    description: '品質予測用のサンプルデータ。製造条件、材料情報、オペレーター情報などを含みます。',
  },
  attrition: {
    columns: ['employee_id', 'age', 'department', 'job_level', 'years_at_company', 'salary', 'overtime_hours', 'satisfaction_score', 'performance_rating', 'left_company'],
    description: '離職予測用のサンプルデータ。従業員属性、勤務状況、評価情報などを含みます。',
  },
};

export const DataStep: React.FC<DataStepProps> = ({
  themeDefinition,
  uploadedFileName,
  onFileUpload,
  onGenerateSampleData,
  onNext,
  onBack,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSampleData, setShowSampleData] = useState(false);

  const sampleTemplate = themeDefinition?.useCase 
    ? SAMPLE_DATA_TEMPLATES[themeDefinition.useCase] || SAMPLE_DATA_TEMPLATES.churn
    : SAMPLE_DATA_TEMPLATES.churn;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await onFileUpload(selectedFile);
    } finally {
      setIsUploading(false);
    }
  };

  const generateSampleCSV = () => {
    // サンプルデータを生成してダウンロード
    const headers = sampleTemplate.columns.join(',');
    const rows = [];
    
    for (let i = 0; i < 100; i++) {
      const row = sampleTemplate.columns.map(col => {
        if (col.includes('id')) return `ID_${i + 1}`;
        if (col.includes('date')) return `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
        if (col.includes('age') || col.includes('years')) return Math.floor(Math.random() * 40) + 20;
        if (col.includes('amount') || col.includes('charges') || col.includes('salary') || col.includes('price')) return (Math.random() * 10000).toFixed(2);
        if (col.includes('score') || col.includes('rating')) return (Math.random() * 5).toFixed(1);
        if (col.includes('is_') || col.includes('churned') || col.includes('left') || col.includes('defective')) return Math.random() > 0.8 ? 1 : 0;
        if (col.includes('type') || col.includes('category') || col.includes('department')) return ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
        return (Math.random() * 100).toFixed(2);
      });
      rows.push(row.join(','));
    }
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_${themeDefinition?.useCase || 'data'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 text-sm bg-gray-700 rounded-full text-[#81FBA5]">
          ステップ 2/7
        </span>
        <h2 className="text-2xl font-bold text-white">データ準備</h2>
        <p className="text-gray-400">
          分析に使用するデータをアップロードしてください
        </p>
      </div>

      {/* テーマ情報サマリー */}
      {themeDefinition && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-[#81FBA5]" />
            <span className="font-semibold text-white">選択中のテーマ</span>
          </div>
          <p className="text-gray-300">{themeDefinition.title}</p>
          <p className="text-gray-400 text-sm mt-1">
            {themeDefinition.industryName} / {themeDefinition.useCaseName}
          </p>
        </div>
      )}

      {/* サンプルデータセクション */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-white">サンプルデータ</span>
          </div>
          <button
            onClick={() => setShowSampleData(!showSampleData)}
            className="text-sm text-[#81FBA5] hover:underline"
          >
            {showSampleData ? '閉じる' : '詳細を見る'}
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          {sampleTemplate.description}
        </p>

        {showSampleData && (
          <div className="mb-4 overflow-x-auto">
            <div className="flex gap-2 flex-wrap">
              {sampleTemplate.columns.map(col => (
                <span
                  key={col}
                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={generateSampleCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            サンプルCSVをダウンロード
          </button>
          <button
            onClick={onGenerateSampleData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AIにサンプルを生成させる
          </button>
        </div>
      </div>

      {/* ファイルアップロード */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-4">データファイルをアップロード</h3>
        <FileUploadWidget
          onFileSelect={handleFileSelect}
          onUpload={handleUpload}
          isUploading={isUploading}
          uploadedFileName={uploadedFileName}
        />
      </div>

      {/* ナビゲーション */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>
        <button
          onClick={onNext}
          disabled={!uploadedFileName}
          className={`
            px-6 py-2 font-semibold rounded-lg flex items-center gap-2 transition-colors
            ${uploadedFileName
              ? 'bg-[#81FBA5] text-gray-900 hover:bg-[#6de992]'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          次へ
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
