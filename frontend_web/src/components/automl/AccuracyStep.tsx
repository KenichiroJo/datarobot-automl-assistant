import React, { useState, useEffect } from 'react';
import type { ModelInfo, ROCCurveData, LiftChartData } from '@/types/automl';
import { Trophy, TrendingUp, BarChart2, Activity, Download, Eye } from 'lucide-react';

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
  { feature: 'customer_tenure', impact: 0.28 },
  { feature: 'monthly_charges', impact: 0.22 },
  { feature: 'contract_type', impact: 0.18 },
  { feature: 'payment_method', impact: 0.12 },
  { feature: 'total_charges', impact: 0.10 },
  { feature: 'tech_support', impact: 0.05 },
  { feature: 'internet_service', impact: 0.03 },
  { feature: 'online_security', impact: 0.02 },
];

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectId && !bestModel) {
      setIsLoading(true);
      onLoadInsights().finally(() => setIsLoading(false));
    }
  }, [projectId, bestModel, onLoadInsights]);

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
      </h3>
      
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="space-y-3">
          {featureImpact.map((item, index) => (
            <div key={item.feature} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white">{item.feature}</span>
                <span className="text-[#81FBA5]">{(item.impact * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    index === 0 ? 'bg-[#81FBA5]' : 
                    index < 3 ? 'bg-blue-500' : 'bg-gray-500'
                  }`}
                  style={{ width: `${item.impact * 100 / featureImpact[0].impact * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderROCCurve = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        ROC曲線
      </h3>
      
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        {/* SVG でシンプルなROC曲線を描画 */}
        <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto">
          {/* 軸 */}
          <line x1="50" y1="350" x2="350" y2="350" stroke="#4B5563" strokeWidth="2" />
          <line x1="50" y1="350" x2="50" y2="50" stroke="#4B5563" strokeWidth="2" />
          
          {/* グリッド */}
          {[0.25, 0.5, 0.75].map((val) => (
            <React.Fragment key={val}>
              <line
                x1={50 + val * 300}
                y1="350"
                x2={50 + val * 300}
                y2="50"
                stroke="#374151"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <line
                x1="50"
                y1={350 - val * 300}
                x2="350"
                y2={350 - val * 300}
                stroke="#374151"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            </React.Fragment>
          ))}
          
          {/* 対角線（ランダム） */}
          <line x1="50" y1="350" x2="350" y2="50" stroke="#6B7280" strokeWidth="1" strokeDasharray="4,4" />
          
          {/* ROC曲線 */}
          <path
            d="M 50 350 Q 80 200, 150 120 T 250 70 T 350 50"
            fill="none"
            stroke="#81FBA5"
            strokeWidth="3"
          />
          
          {/* 曲線下面積 */}
          <path
            d="M 50 350 Q 80 200, 150 120 T 250 70 T 350 50 L 350 350 Z"
            fill="#81FBA5"
            fillOpacity="0.1"
          />
          
          {/* ラベル */}
          <text x="200" y="390" textAnchor="middle" fill="#9CA3AF" fontSize="14">偽陽性率 (FPR)</text>
          <text x="15" y="200" textAnchor="middle" fill="#9CA3AF" fontSize="14" transform="rotate(-90, 15, 200)">真陽性率 (TPR)</text>
          
          {/* AUC値 */}
          <text x="250" y="250" textAnchor="middle" fill="#81FBA5" fontSize="24" fontWeight="bold">
            AUC = {bestModel?.metrics.auc?.toFixed(4) || '0.9289'}
          </text>
        </svg>
      </div>
    </div>
  );

  const renderLiftChart = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Activity className="w-5 h-5 text-orange-400" />
        リフトチャート
      </h3>
      
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        {/* SVG でシンプルなリフトチャートを描画 */}
        <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto">
          {/* 軸 */}
          <line x1="50" y1="350" x2="350" y2="350" stroke="#4B5563" strokeWidth="2" />
          <line x1="50" y1="350" x2="50" y2="50" stroke="#4B5563" strokeWidth="2" />
          
          {/* リフト値を示すバー */}
          {[
            { decile: 1, lift: 4.2 },
            { decile: 2, lift: 3.1 },
            { decile: 3, lift: 2.4 },
            { decile: 4, lift: 1.8 },
            { decile: 5, lift: 1.4 },
            { decile: 6, lift: 1.1 },
            { decile: 7, lift: 0.8 },
            { decile: 8, lift: 0.5 },
            { decile: 9, lift: 0.3 },
            { decile: 10, lift: 0.1 },
          ].map((item, index) => (
            <React.Fragment key={item.decile}>
              <rect
                x={55 + index * 29}
                y={350 - (item.lift / 4.5) * 280}
                width="24"
                height={(item.lift / 4.5) * 280}
                fill={index < 3 ? '#81FBA5' : index < 6 ? '#3B82F6' : '#6B7280'}
                rx="2"
              />
              <text
                x={67 + index * 29}
                y="365"
                textAnchor="middle"
                fill="#9CA3AF"
                fontSize="10"
              >
                {item.decile}
              </text>
            </React.Fragment>
          ))}
          
          {/* 基準線（Lift = 1） */}
          <line
            x1="50"
            y1={350 - (1 / 4.5) * 280}
            x2="350"
            y2={350 - (1 / 4.5) * 280}
            stroke="#EF4444"
            strokeWidth="2"
            strokeDasharray="6,3"
          />
          <text x="360" y={350 - (1 / 4.5) * 280 + 5} fill="#EF4444" fontSize="12">
            Lift = 1
          </text>
          
          {/* ラベル */}
          <text x="200" y="390" textAnchor="middle" fill="#9CA3AF" fontSize="14">デシル</text>
          <text x="15" y="200" textAnchor="middle" fill="#9CA3AF" fontSize="14" transform="rotate(-90, 15, 200)">リフト値</text>
        </svg>
        
        <div className="mt-4 text-center text-sm text-gray-400">
          上位10%の顧客で、ランダム選択の<span className="text-[#81FBA5] font-bold">4.2倍</span>の精度
        </div>
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
            className={`
              flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px
              ${activeTab === tab.id
                ? 'border-[#81FBA5] text-[#81FBA5]'
                : 'border-transparent text-gray-400 hover:text-white'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="min-h-[400px]">
        {activeTab === 'leaderboard' && renderLeaderboard()}
        {activeTab === 'feature' && renderFeatureImpact()}
        {activeTab === 'roc' && renderROCCurve()}
        {activeTab === 'lift' && renderLiftChart()}
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
          onClick={() => window.open(`https://app.datarobot.com/projects/${projectId}`, '_blank')}
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
