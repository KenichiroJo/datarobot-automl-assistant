import React, { useState } from 'react';
import type { DatasetInfo, ThemeDefinition } from '@/types/automl';
import { BarChart3, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface PrepareStepProps {
  themeDefinition: ThemeDefinition | null;
  datasetInfo: DatasetInfo | null;
  onAnalyzeData: () => Promise<void>;
  onNext: () => void;
  onBack: () => void;
}

export const PrepareStep: React.FC<PrepareStepProps> = ({
  themeDefinition,
  datasetInfo,
  onAnalyzeData,
  onNext,
  onBack,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await onAnalyzeData();
      setAnalysisComplete(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 text-sm bg-gray-700 rounded-full text-[#81FBA5]">
          ステップ 3/7
        </span>
        <h2 className="text-2xl font-bold text-white">データ整形・EDA</h2>
        <p className="text-gray-400">
          データセットの品質を確認し、分析を行います
        </p>
      </div>

      {/* データセット情報 */}
      {datasetInfo ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#81FBA5]" />
            <span className="font-semibold text-white">データセット情報</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{datasetInfo.rows.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">行数</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{datasetInfo.columns}</p>
              <p className="text-gray-400 text-sm">カラム数</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#81FBA5]">
                {datasetInfo.targetColumn || '未設定'}
              </p>
              <p className="text-gray-400 text-sm">ターゲット</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{themeDefinition?.targetType || '-'}</p>
              <p className="text-gray-400 text-sm">問題タイプ</p>
            </div>
          </div>

          {/* 特徴量一覧 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-2">特徴量一覧</h4>
            <div className="flex flex-wrap gap-2">
              {datasetInfo.features.map(feature => (
                <span
                  key={feature}
                  className={`px-2 py-1 text-xs rounded ${
                    feature === datasetInfo.targetColumn
                      ? 'bg-[#81FBA5]/20 text-[#81FBA5] border border-[#81FBA5]'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {feature}
                  {feature === datasetInfo.targetColumn && ' (ターゲット)'}
                </span>
              ))}
            </div>
          </div>

          {/* 分析ボタン */}
          {!analysisComplete ? (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`
                w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
                ${isAnalyzing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-[#81FBA5] text-gray-900 hover:bg-[#6de992]'
                }
              `}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  データを分析中...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  探索的データ分析（EDA）を実行
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 p-4 bg-[#81FBA5]/10 border border-[#81FBA5] rounded-lg">
              <CheckCircle className="w-5 h-5 text-[#81FBA5]" />
              <span className="text-[#81FBA5]">データ分析が完了しました</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-800 border border-yellow-500/50 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-white font-medium">データセットが読み込まれていません</p>
              <p className="text-gray-400 text-sm">前のステップでデータをアップロードしてください</p>
            </div>
          </div>
        </div>
      )}

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
          disabled={!analysisComplete}
          className={`
            px-6 py-2 font-semibold rounded-lg flex items-center gap-2 transition-colors
            ${analysisComplete
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
