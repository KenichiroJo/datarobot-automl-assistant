import React, { useState } from 'react';
import type { ThemeDefinition } from '@/types/automl';
import { Settings2, Play, Loader2, CheckCircle, Info } from 'lucide-react';

interface BuildStepProps {
  themeDefinition: ThemeDefinition | null;
  datasetId: string | null;
  onStartAutopilot: (config: AutopilotConfig) => Promise<void>;
  onNext: () => void;
  onBack: () => void;
}

export interface AutopilotConfig {
  mode: 'quick' | 'comprehensive' | 'manual';
  featurelistName?: string;
  targetColumn: string;
  metric?: string;
  partitionColumn?: string;
  holdoutPct?: number;
  validationPct?: number;
  maxWait?: number;
}

const AUTOPILOT_MODES = [
  {
    id: 'quick' as const,
    name: 'クイックモード',
    description: '最速でモデルを構築。基本的なモデルのみを試行します。',
    icon: '⚡',
    duration: '約5-15分',
  },
  {
    id: 'comprehensive' as const,
    name: '網羅モード',
    description: '全てのブループリントを試行し、最高精度を追求します。',
    icon: '🎯',
    duration: '約30-60分',
  },
  {
    id: 'manual' as const,
    name: 'マニュアルモード',
    description: 'ブループリントを手動で選択して実行します。',
    icon: '🔧',
    duration: '選択次第',
  },
];

const METRICS_BY_TYPE: Record<string, { value: string; label: string }[]> = {
  binary: [
    { value: 'AUC', label: 'AUC (ROC曲線下面積)' },
    { value: 'LogLoss', label: 'LogLoss' },
    { value: 'Accuracy', label: '正確度' },
    { value: 'F1', label: 'F1スコア' },
    { value: 'Gini', label: 'ジニ係数' },
  ],
  regression: [
    { value: 'RMSE', label: 'RMSE (二乗平均平方根誤差)' },
    { value: 'MAE', label: 'MAE (平均絶対誤差)' },
    { value: 'R2', label: 'R² (決定係数)' },
    { value: 'MAPE', label: 'MAPE (平均絶対パーセント誤差)' },
  ],
  multiclass: [
    { value: 'LogLoss', label: 'LogLoss' },
    { value: 'Accuracy', label: '正確度' },
    { value: 'WeightedF1', label: '加重F1スコア' },
  ],
  timeseries: [
    { value: 'RMSE', label: 'RMSE (二乗平均平方根誤差)' },
    { value: 'MAE', label: 'MAE (平均絶対誤差)' },
    { value: 'MAPE', label: 'MAPE (平均絶対パーセント誤差)' },
  ],
};

export const BuildStep: React.FC<BuildStepProps> = ({
  themeDefinition,
  datasetId,
  onStartAutopilot,
  onNext,
  onBack,
}) => {
  const [selectedMode, setSelectedMode] = useState<'quick' | 'comprehensive' | 'manual'>('quick');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildComplete, setBuildComplete] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedConfig, setAdvancedConfig] = useState({
    holdoutPct: 20,
    validationPct: 16,
    maxWait: 300,
  });

  const targetType = themeDefinition?.targetType || 'binary';
  const metrics = METRICS_BY_TYPE[targetType] || METRICS_BY_TYPE.binary;

  React.useEffect(() => {
    if (metrics.length > 0 && !selectedMetric) {
      setSelectedMetric(metrics[0].value);
    }
  }, [metrics, selectedMetric]);

  const handleBuild = async () => {
    if (!themeDefinition || !datasetId) return;
    
    setIsBuilding(true);
    try {
      await onStartAutopilot({
        mode: selectedMode,
        targetColumn: themeDefinition.targetColumn || 'target',
        metric: selectedMetric,
        holdoutPct: advancedConfig.holdoutPct,
        validationPct: advancedConfig.validationPct,
        maxWait: advancedConfig.maxWait,
      });
      setBuildComplete(true);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 text-sm bg-gray-700 rounded-full text-[#81FBA5]">
          ステップ 4/7
        </span>
        <h2 className="text-2xl font-bold text-white">モデル構築</h2>
        <p className="text-gray-400">
          Autopilotでモデルを自動構築します
        </p>
      </div>

      {/* 情報表示 */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-white">構築設定</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">問題タイプ:</span>
            <span className="text-white ml-2">
              {targetType === 'binary' && '二値分類'}
              {targetType === 'regression' && '回帰'}
              {targetType === 'multiclass' && '多クラス分類'}
              {targetType === 'timeseries' && '時系列予測'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">ターゲット:</span>
            <span className="text-[#81FBA5] ml-2">{themeDefinition?.targetColumn || '未設定'}</span>
          </div>
          <div>
            <span className="text-gray-400">データセットID:</span>
            <span className="text-white ml-2 font-mono text-xs">{datasetId?.slice(0, 12)}...</span>
          </div>
        </div>
      </div>

      {/* モード選択 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-[#81FBA5]" />
          Autopilotモード
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {AUTOPILOT_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              disabled={isBuilding || buildComplete}
              className={`
                p-4 rounded-lg border text-left transition-all
                ${selectedMode === mode.id
                  ? 'border-[#81FBA5] bg-[#81FBA5]/10'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }
                ${(isBuilding || buildComplete) && 'opacity-50 cursor-not-allowed'}
              `}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <div className="font-semibold text-white">{mode.name}</div>
              <div className="text-sm text-gray-400 mb-2">{mode.description}</div>
              <div className="text-xs text-[#81FBA5]">{mode.duration}</div>
            </button>
          ))}
        </div>
      </div>

      {/* メトリック選択 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">評価指標</h3>
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.value}
              onClick={() => setSelectedMetric(metric.value)}
              disabled={isBuilding || buildComplete}
              className={`
                px-4 py-2 rounded-lg border transition-all
                ${selectedMetric === metric.value
                  ? 'border-[#81FBA5] bg-[#81FBA5]/10 text-[#81FBA5]'
                  : 'border-gray-700 text-gray-300 hover:border-gray-600'
                }
                ${(isBuilding || buildComplete) && 'opacity-50 cursor-not-allowed'}
              `}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* 詳細設定 */}
      <div className="border-t border-gray-700 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          詳細設定
        </button>
        
        {showAdvanced && (
          <div className="mt-4 grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">ホールドアウト (%)</label>
              <input
                type="number"
                value={advancedConfig.holdoutPct}
                onChange={(e) => setAdvancedConfig(prev => ({
                  ...prev,
                  holdoutPct: parseInt(e.target.value) || 20
                }))}
                disabled={isBuilding || buildComplete}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">検証データ (%)</label>
              <input
                type="number"
                value={advancedConfig.validationPct}
                onChange={(e) => setAdvancedConfig(prev => ({
                  ...prev,
                  validationPct: parseInt(e.target.value) || 16
                }))}
                disabled={isBuilding || buildComplete}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">最大待機時間 (秒)</label>
              <input
                type="number"
                value={advancedConfig.maxWait}
                onChange={(e) => setAdvancedConfig(prev => ({
                  ...prev,
                  maxWait: parseInt(e.target.value) || 300
                }))}
                disabled={isBuilding || buildComplete}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* 実行ボタン */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        {!buildComplete ? (
          <button
            onClick={handleBuild}
            disabled={isBuilding || !datasetId}
            className={`
              w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3
              ${isBuilding || !datasetId
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-[#81FBA5] text-gray-900 hover:bg-[#6de992]'
              }
            `}
          >
            {isBuilding ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Autopilot 実行中...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Autopilot を開始
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-3 p-4 bg-[#81FBA5]/10 border border-[#81FBA5] rounded-lg">
            <CheckCircle className="w-6 h-6 text-[#81FBA5]" />
            <span className="text-[#81FBA5] font-semibold">Autopilotが完了しました</span>
          </div>
        )}
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
          disabled={!buildComplete}
          className={`
            px-6 py-2 font-semibold rounded-lg flex items-center gap-2 transition-colors
            ${buildComplete
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
