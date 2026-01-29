import React, { useState } from 'react';
import type { ThemeDefinition } from '@/types/automl';

interface ThemeDefinitionFormProps {
  initialData: ThemeDefinition;
  onSave: (data: ThemeDefinition) => void;
  onBack: () => void;
  onNext: () => void;
}

type TabId = 'problem' | 'data' | 'business' | 'team';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'problem', label: '課題の明確化', icon: '🎯' },
  { id: 'data', label: 'データとモデリング', icon: '📊' },
  { id: 'business', label: 'ビジネス適用', icon: '💼' },
  { id: 'team', label: '担当者・日程', icon: '👥' },
];

export const ThemeDefinitionForm: React.FC<ThemeDefinitionFormProps> = ({
  initialData,
  onSave,
  onBack,
  onNext,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('problem');
  const [formData, setFormData] = useState<ThemeDefinition>(initialData);

  const updateField = (field: keyof ThemeDefinition, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSave(updated);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'problem':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                プロジェクトタイトル
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder="例: 顧客離反予測による売上維持"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                解決したい課題とアクション
              </label>
              <textarea
                value={formData.problemStatement}
                onChange={e => updateField('problemStatement', e.target.value)}
                placeholder="例: 顧客の離反を事前に予測し、リテンション施策を実施することで売上減少を防ぎたい"
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                現在の業務フロー
              </label>
              <textarea
                value={formData.currentWorkflow}
                onChange={e => updateField('currentWorkflow', e.target.value)}
                placeholder="例: 現在は過去の購買履歴から手動で離反リスクを判定しているが、精度が低く対応が遅れている"
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
              />
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                予測対象（ターゲット）
              </label>
              <input
                type="text"
                value={formData.targetVariable}
                onChange={e => updateField('targetVariable', e.target.value)}
                placeholder="例: 離反フラグ（0: 継続, 1: 離反）"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                使用するデータセット
              </label>
              <textarea
                value={formData.datasetDescription}
                onChange={e => updateField('datasetDescription', e.target.value)}
                placeholder="例: 顧客マスタ、購買履歴、Webアクセスログ"
                rows={2}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                データソースと特徴量
              </label>
              <textarea
                value={formData.dataSourcesAndFeatures}
                onChange={e => updateField('dataSourcesAndFeatures', e.target.value)}
                placeholder="例: CRM（顧客属性）、ECサイト（購買履歴）、GA（アクセスログ）"
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                予測の対象グループとサンプル数
              </label>
              <input
                type="text"
                value={formData.targetGroupAndSampleSize}
                onChange={e => updateField('targetGroupAndSampleSize', e.target.value)}
                placeholder="例: アクティブ顧客 10万人、学習データ 3年分"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                モデルがビジネス適用される条件
              </label>
              <textarea
                value={formData.businessApplicationConditions}
                onChange={e => updateField('businessApplicationConditions', e.target.value)}
                placeholder="例: AUC 0.8以上、離反予測の適合率 70%以上"
                rows={2}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
              />
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                業務における実運用フロー
              </label>
              <textarea
                value={formData.operationalWorkflow}
                onChange={e => updateField('operationalWorkflow', e.target.value)}
                placeholder="例: 毎週月曜に予測を実行し、高リスク顧客リストを営業チームに共有"
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                予測のタイプ
              </label>
              <select
                value={formData.predictionType}
                onChange={e => updateField('predictionType', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#81FBA5]"
              >
                <option value="">選択してください</option>
                <option value="batch">バッチ予測（定期実行）</option>
                <option value="realtime">リアルタイム予測</option>
                <option value="both">両方</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                システム連携
              </label>
              <textarea
                value={formData.systemIntegration}
                onChange={e => updateField('systemIntegration', e.target.value)}
                placeholder="例: Salesforce連携、自社CRMへのAPI連携"
                rows={2}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                計算可能なインパクト
              </label>
              <textarea
                value={formData.calculableImpact}
                onChange={e => updateField('calculableImpact', e.target.value)}
                placeholder="例: 離反率5%改善で年間売上1億円維持"
                rows={2}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                計算不可能なインパクト
              </label>
              <textarea
                value={formData.nonCalculableImpact}
                onChange={e => updateField('nonCalculableImpact', e.target.value)}
                placeholder="例: 顧客満足度向上、ブランドイメージ改善"
                rows={2}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
              />
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  プロジェクトオーナー
                </label>
                <input
                  type="text"
                  value={formData.projectOwner}
                  onChange={e => updateField('projectOwner', e.target.value)}
                  placeholder="氏名・部署"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  事業担当
                </label>
                <input
                  type="text"
                  value={formData.businessOwner}
                  onChange={e => updateField('businessOwner', e.target.value)}
                  placeholder="氏名・部署"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  データ準備担当
                </label>
                <input
                  type="text"
                  value={formData.dataPreparationOwner}
                  onChange={e => updateField('dataPreparationOwner', e.target.value)}
                  placeholder="氏名・部署"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  モデリング担当
                </label>
                <input
                  type="text"
                  value={formData.modelingOwner}
                  onChange={e => updateField('modelingOwner', e.target.value)}
                  placeholder="氏名・部署"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  意思決定者
                </label>
                <input
                  type="text"
                  value={formData.decisionMaker}
                  onChange={e => updateField('decisionMaker', e.target.value)}
                  placeholder="氏名・部署"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  システム実装担当
                </label>
                <input
                  type="text"
                  value={formData.systemImplementer}
                  onChange={e => updateField('systemImplementer', e.target.value)}
                  placeholder="氏名・部署"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  データ準備完了予定日
                </label>
                <input
                  type="date"
                  value={formData.dataPreparationDeadline}
                  onChange={e => updateField('dataPreparationDeadline', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#81FBA5]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  モデリング完了予定日
                </label>
                <input
                  type="date"
                  value={formData.modelingDeadline}
                  onChange={e => updateField('modelingDeadline', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#81FBA5]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ビジネス適用予定日
                </label>
                <input
                  type="date"
                  value={formData.businessApplicationDate}
                  onChange={e => updateField('businessApplicationDate', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#81FBA5]"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 text-sm bg-gray-700 rounded-full text-[#81FBA5]">
          ステップ 1/7
        </span>
        <h2 className="text-2xl font-bold text-white">テーマ定義シート</h2>
        <p className="text-gray-400">
          プロジェクトの詳細を入力してください
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors
              ${activeTab === tab.id
                ? 'bg-gray-700 text-[#81FBA5] border-b-2 border-[#81FBA5]'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="bg-gray-800 rounded-lg p-6">
        {renderTabContent()}
      </div>

      {/* ナビゲーションボタン */}
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
          className="px-6 py-2 bg-[#81FBA5] text-gray-900 font-semibold rounded-lg hover:bg-[#6de992] transition-colors flex items-center gap-2"
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
