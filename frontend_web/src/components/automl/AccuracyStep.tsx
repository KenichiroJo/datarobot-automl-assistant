import React, { useState, useEffect, useMemo } from 'react';
import type { ModelInfo, ROCCurveData, LiftChartData } from '@/types/automl';
import { Trophy, TrendingUp, BarChart2, Activity, Download, Eye } from 'lucide-react';
import { ROCCurveChart, FeatureImpactChart, LiftChart } from './charts';

interface AccuracyStepProps {
  projectId: string | null;
  bestModel: ModelInfo | null;
  onLoadInsights: () => Promise<void>;
  onExportReport: () => Promise<void>;
  onNext: () => void;
  onBack: () => void;
}

// プレースホルダーデータ（実際のAPIからのデータで上書きされる）
const PLACEHOLDER_FEATURE_IMPACT = [
  { featureName: 'customer_tenure', impact: 0.28 },
  { featureName: 'monthly_charges', impact: 0.22 },
  { featureName: 'contract_type', impact: 0.18 },
  { featureName: 'payment_method', impact: 0.12 },
  { featureName: 'total_charges', impact: 0.10 },
  { featureName: 'tech_support', impact: 0.05 },
  { featureName: 'internet_service', impact: 0.03 },
  { featureName: 'online_security', impact: 0.02 },
];

// プレースホルダーROCデータ
const PLACEHOLDER_ROC_DATA: ROCCurveData = {
  fpr: [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
  tpr: [0, 0.35, 0.55, 0.68, 0.78, 0.86, 0.91, 0.94, 0.96, 0.98, 0.99, 0.995, 1.0],
  auc: 0.9289,
  thresholds: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.15, 0.1, 0.05, 0.0],
};

// プレースホルダーリフトデータ
const PLACEHOLDER_LIFT_DATA: LiftChartData = {
  bins: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  lift: [4.2, 3.1, 2.4, 1.8, 1.4, 1.1, 0.8, 0.5, 0.3, 0.1],
  actual: [0.42, 0.31, 0.24, 0.18, 0.14, 0.11, 0.08, 0.05, 0.03, 0.01],
};

export const AccuracyStep: React.FC<AccuracyStepProps> = ({
  projectId,
  bestModel,
  onLoadInsights,
  onExportReport,
  onNext,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'feature' | 'roc' | 'lift'>('leaderboard');
  const [featureImpact, setFeatureImpact] = useState(PLACEHOLDER_FEATURE_IMPACT);
  const [rocData, setRocData] = useState<ROCCurveData>(PLACEHOLDER_ROC_DATA);
  const [liftData, setLiftData] = useState<LiftChartData>(PLACEHOLDER_LIFT_DATA);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectId && !bestModel) {
      setIsLoading(true);
      onLoadInsights().finally(() => setIsLoading(false));
    }
  }, [projectId, bestModel, onLoadInsights]);

  // bestModelのAUCでROCデータを更新
  const currentRocData = useMemo(() => {
    if (bestModel?.metrics.auc) {
      return { ...rocData, auc: bestModel.metrics.auc };
    }
    return rocData;
  }, [bestModel, rocData]);

  const renderLeaderboard = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        モデルリーダーボード
      </h3>
      
      {bestModel ? (
        <div className="space-y-3">
          {/* ベストモデル */}
          <div className="bg-gradient-to-r from-[#81FBA5]/20 to-transparent border border-[#81FBA5] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥇</span>
                <div>
                  <div className="font-semibold text-white">{bestModel.modelType}</div>
                  <div className="text-sm text-gray-400">推奨モデル</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#81FBA5]">
                  {(bestModel.metrics.auc || bestModel.metrics.accuracy || 0).toFixed(4)}
                </div>
                <div className="text-sm text-gray-400">{bestModel.metrics.auc ? 'AUC' : 'Accuracy'}</div>
              </div>
            </div>
          </div>
          
          {/* その他のモデル（プレースホルダー） */}
          {[
            { rank: 2, name: 'Gradient Boosting', score: 0.9234 },
            { rank: 3, name: 'Random Forest', score: 0.9187 },
            { rank: 4, name: 'Light GBM', score: 0.9156 },
            { rank: 5, name: 'XGBoost', score: 0.9089 },
          ].map((model) => (
            <div key={model.rank} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg opacity-50">
                    {model.rank === 2 ? '🥈' : model.rank === 3 ? '🥉' : `#${model.rank}`}
                  </span>
                  <div className="font-medium text-gray-300">{model.name}</div>
                </div>
                <div className="text-lg font-semibold text-gray-400">
                  {model.score.toFixed(4)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">モデル情報を読み込み中...</p>
        </div>
      )}
    </div>
  );

  const renderFeatureImpact = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-blue-400" />
        特徴量の重要度
        <span className="ml-2 text-xs text-gray-400 font-normal">
          （インタラクティブ：ホバーで詳細表示）
        </span>
      </h3>
      
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <FeatureImpactChart
          data={featureImpact}
          width={600}
          height={400}
          topN={10}
          showPercentage={true}
        />
      </div>
    </div>
  );

  const renderROCCurve = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        ROC曲線
        <span className="ml-2 text-xs text-gray-400 font-normal">
          （ズーム・パン対応、カメラアイコンで画像保存）
        </span>
      </h3>
      
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex justify-center">
        <ROCCurveChart
          data={currentRocData}
          width={550}
          height={450}
          showLegend={true}
        />
      </div>
      
      <div className="text-center text-sm text-gray-400">
        AUC（曲線下面積）が1に近いほど、モデルの分類性能が高いことを示します
      </div>
    </div>
  );

  const renderLiftChart = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Activity className="w-5 h-5 text-orange-400" />
        リフトチャート
        <span className="ml-2 text-xs text-gray-400 font-normal">
          （ホバーでリフト値表示）
        </span>
      </h3>
      
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex justify-center">
        <LiftChart
          data={liftData}
          width={550}
          height={450}
          showCumulative={true}
        />
      </div>
      
      <div className="text-center text-sm text-gray-400">
        上位10%の顧客で、ランダム選択の
        <span className="text-[#81FBA5] font-bold mx-1">{liftData.lift[0].toFixed(1)}倍</span>
        の精度
      </div>
    </div>
  );

  const tabs = [
    { id: 'leaderboard', label: 'リーダーボード', icon: Trophy },
    { id: 'feature', label: '特徴量重要度', icon: BarChart2 },
    { id: 'roc', label: 'ROC曲線', icon: TrendingUp },
    { id: 'lift', label: 'リフトチャート', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 text-sm bg-gray-700 rounded-full text-[#81FBA5]">
          ステップ 5/7
        </span>
        <h2 className="text-2xl font-bold text-white">精度確認</h2>
        <p className="text-gray-400">
          モデルの性能と特徴量の重要度を確認します
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="flex space-x-2 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={\`
              flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px
              \${activeTab === tab.id
                ? 'border-[#81FBA5] text-[#81FBA5]'
                : 'border-transparent text-gray-400 hover:text-white'
              }
            \`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="min-h-[500px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81FBA5]"></div>
          </div>
        ) : (
          <>
            {activeTab === 'leaderboard' && renderLeaderboard()}
            {activeTab === 'feature' && renderFeatureImpact()}
            {activeTab === 'roc' && renderROCCurve()}
            {activeTab === 'lift' && renderLiftChart()}
          </>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <button
          onClick={onExportReport}
          className="flex-1 py-3 border border-gray-600 rounded-lg text-gray-300 hover:border-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          レポートをダウンロード
        </button>
        <button
          onClick={() => window.open(\`https://app.datarobot.com/projects/\${projectId}\`, '_blank')}
          disabled={!projectId}
          className="flex-1 py-3 border border-[#81FBA5] text-[#81FBA5] rounded-lg hover:bg-[#81FBA5]/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Eye className="w-5 h-5" />
          DataRobotで詳細を見る
        </button>
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
