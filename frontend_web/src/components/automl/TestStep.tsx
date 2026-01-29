import React, { useState } from 'react';
import type { ModelInfo } from '@/types/automl';
import { FlaskConical, Upload, Play, Loader2, CheckCircle, Download, AlertCircle } from 'lucide-react';

interface TestStepProps {
  projectId: string | null;
  modelId: string | null;
  bestModel: ModelInfo | null;
  onPredict: (data: Record<string, unknown>) => Promise<PredictionResult>;
  onNext: () => void;
  onBack: () => void;
}

interface PredictionResult {
  prediction: number | string;
  probability?: number;
  positiveClass?: string;
  explanations?: Array<{
    feature: string;
    strength: number;
    direction: 'positive' | 'negative';
  }>;
}

const SAMPLE_INPUT_FIELDS = [
  { name: 'customer_tenure', label: '契約期間（月）', type: 'number', placeholder: '24' },
  { name: 'monthly_charges', label: '月額料金', type: 'number', placeholder: '79.99' },
  { name: 'contract_type', label: '契約タイプ', type: 'select', options: ['Month-to-month', 'One year', 'Two year'] },
  { name: 'payment_method', label: '支払い方法', type: 'select', options: ['Electronic check', 'Mailed check', 'Bank transfer', 'Credit card'] },
  { name: 'total_charges', label: '累計支払額', type: 'number', placeholder: '1892.50' },
  { name: 'tech_support', label: 'テックサポート', type: 'select', options: ['Yes', 'No'] },
];

export const TestStep: React.FC<TestStepProps> = ({
  projectId,
  modelId,
  bestModel,
  onPredict,
  onNext,
  onBack,
}) => {
  const [inputMode, setInputMode] = useState<'form' | 'file'>('form');
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    setIsPredicting(true);
    setError(null);
    try {
      const result = await onPredict(formData);
      setPredictionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予測中にエラーが発生しました');
    } finally {
      setIsPredicting(false);
    }
  };

  const fillSampleData = () => {
    setFormData({
      customer_tenure: 24,
      monthly_charges: 79.99,
      contract_type: 'Month-to-month',
      payment_method: 'Electronic check',
      total_charges: 1892.50,
      tech_support: 'No',
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 text-sm bg-gray-700 rounded-full text-[#81FBA5]">
          ステップ 6/7
        </span>
        <h2 className="text-2xl font-bold text-white">テスト予測</h2>
        <p className="text-gray-400">
          構築したモデルで予測をテストします
        </p>
      </div>

      {/* モデル情報 */}
      {bestModel && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FlaskConical className="w-6 h-6 text-[#81FBA5]" />
              <div>
                <div className="font-semibold text-white">使用モデル</div>
                <div className="text-sm text-gray-400">{bestModel.modelType}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#81FBA5]">
                {(bestModel.metrics.auc || bestModel.metrics.accuracy || 0).toFixed(4)}
              </div>
              <div className="text-xs text-gray-400">{bestModel.metrics.auc ? 'AUC' : 'Accuracy'}</div>
            </div>
          </div>
        </div>
      )}

      {/* 入力モード切り替え */}
      <div className="flex gap-2">
        <button
          onClick={() => setInputMode('form')}
          className={`
            flex-1 py-2 rounded-lg font-medium transition-colors
            ${inputMode === 'form'
              ? 'bg-[#81FBA5] text-gray-900'
              : 'bg-gray-800 text-gray-400 hover:text-white'
            }
          `}
        >
          フォーム入力
        </button>
        <button
          onClick={() => setInputMode('file')}
          className={`
            flex-1 py-2 rounded-lg font-medium transition-colors
            ${inputMode === 'file'
              ? 'bg-[#81FBA5] text-gray-900'
              : 'bg-gray-800 text-gray-400 hover:text-white'
            }
          `}
        >
          ファイルアップロード
        </button>
      </div>

      {/* フォーム入力モード */}
      {inputMode === 'form' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">予測データ入力</h3>
            <button
              onClick={fillSampleData}
              className="text-sm text-[#81FBA5] hover:underline"
            >
              サンプルデータを入力
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {SAMPLE_INPUT_FIELDS.map((field) => (
              <div key={field.name}>
                <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.name] as string || ''}
                    onChange={(e) => handleFormChange(field.name, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">選択してください</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFormChange(field.name, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ファイルアップロードモード */}
      {inputMode === 'file' && (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-white mb-2">予測用CSVファイルをドロップ</p>
          <p className="text-gray-400 text-sm mb-4">または</p>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            ファイルを選択
          </button>
          <p className="text-gray-500 text-xs mt-4">
            ヘッダー行を含むCSV形式のファイルをアップロードしてください
          </p>
        </div>
      )}

      {/* 予測実行ボタン */}
      <button
        onClick={handlePredict}
        disabled={isPredicting || Object.keys(formData).length === 0}
        className={`
          w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3
          ${isPredicting || Object.keys(formData).length === 0
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-[#81FBA5] text-gray-900 hover:bg-[#6de992]'
          }
        `}
      >
        {isPredicting ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            予測を実行中...
          </>
        ) : (
          <>
            <Play className="w-6 h-6" />
            予測を実行
          </>
        )}
      </button>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* 予測結果 */}
      {predictionResult && (
        <div className="bg-gray-800 border border-[#81FBA5] rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-[#81FBA5]" />
            <h3 className="text-lg font-semibold text-white">予測結果</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-[#81FBA5] mb-1">
                {typeof predictionResult.prediction === 'number'
                  ? predictionResult.prediction.toFixed(4)
                  : predictionResult.prediction
                }
              </div>
              <div className="text-gray-400">予測値</div>
            </div>
            
            {predictionResult.probability !== undefined && (
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {(predictionResult.probability * 100).toFixed(1)}%
                </div>
                <div className="text-gray-400">確率 ({predictionResult.positiveClass})</div>
              </div>
            )}
          </div>

          {/* 予測の説明 */}
          {predictionResult.explanations && predictionResult.explanations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-300">予測の主な要因</h4>
              {predictionResult.explanations.slice(0, 5).map((exp) => (
                <div key={exp.feature} className="flex items-center gap-3">
                  <span className={`text-lg ${exp.direction === 'positive' ? '↑' : '↓'}`}>
                    {exp.direction === 'positive' ? '📈' : '📉'}
                  </span>
                  <span className="text-white">{exp.feature}</span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        exp.direction === 'positive' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.abs(exp.strength) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
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
          className="px-6 py-2 font-semibold rounded-lg flex items-center gap-2 transition-colors bg-[#81FBA5] text-gray-900 hover:bg-[#6de992]"
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
