import React, { useState } from 'react';
import type { ModelInfo } from '@/types/automl';
import { Rocket, Server, CheckCircle, Loader2, Copy, ExternalLink, Shield, Zap, AlertCircle } from 'lucide-react';

interface DeployStepProps {
  projectId: string | null;
  modelId: string | null;
  bestModel: ModelInfo | null;
  deploymentId: string | null;
  onDeploy: (config: DeployConfig) => Promise<DeploymentResult>;
  onComplete: () => void;
  onBack: () => void;
}

export interface DeployConfig {
  deploymentName: string;
  description?: string;
  enableChallenger?: boolean;
  enableHumility?: boolean;
  enableDataDrift?: boolean;
}

interface DeploymentResult {
  deploymentId: string;
  predictionServer: string;
  apiEndpoint: string;
  status: 'active' | 'pending' | 'error';
}

export const DeployStep: React.FC<DeployStepProps> = ({
  projectId,
  modelId,
  bestModel,
  deploymentId: existingDeploymentId,
  onDeploy,
  onComplete,
  onBack,
}) => {
  const [deploymentName, setDeploymentName] = useState('');
  const [description, setDescription] = useState('');
  const [enableChallenger, setEnableChallenger] = useState(true);
  const [enableHumility, setEnableHumility] = useState(true);
  const [enableDataDrift, setEnableDataDrift] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleDeploy = async () => {
    if (!deploymentName.trim()) {
      setError('デプロイメント名を入力してください');
      return;
    }

    setIsDeploying(true);
    setError(null);
    try {
      const result = await onDeploy({
        deploymentName: deploymentName.trim(),
        description: description.trim(),
        enableChallenger,
        enableHumility,
        enableDataDrift,
      });
      setDeploymentResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'デプロイ中にエラーが発生しました');
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderDeployForm = () => (
    <div className="space-y-6">
      {/* モデル情報 */}
      {bestModel && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-6 h-6 text-[#81FBA5]" />
              <div>
                <div className="font-semibold text-white">デプロイするモデル</div>
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

      {/* デプロイメント設定 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">デプロイメント設定</h3>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            デプロイメント名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={deploymentName}
            onChange={(e) => setDeploymentName(e.target.value)}
            placeholder="例: 顧客離反予測モデル v1.0"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#81FBA5] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">説明（任意）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="デプロイメントの目的や用途を記載"
            rows={3}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#81FBA5] focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* MLOps機能 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          MLOps機能
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <label className="flex items-start gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={enableChallenger}
              onChange={(e) => setEnableChallenger(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-600 text-[#81FBA5] focus:ring-[#81FBA5]"
            />
            <div>
              <div className="font-medium text-white">チャレンジャーモデル</div>
              <div className="text-sm text-gray-400">新モデルを比較テスト</div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={enableHumility}
              onChange={(e) => setEnableHumility(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-600 text-[#81FBA5] focus:ring-[#81FBA5]"
            />
            <div>
              <div className="font-medium text-white">Humility機能</div>
              <div className="text-sm text-gray-400">予測信頼度を監視</div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={enableDataDrift}
              onChange={(e) => setEnableDataDrift(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-600 text-[#81FBA5] focus:ring-[#81FBA5]"
            />
            <div>
              <div className="font-medium text-white">データドリフト</div>
              <div className="text-sm text-gray-400">入力データの変化を検知</div>
            </div>
          </label>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* デプロイボタン */}
      <button
        onClick={handleDeploy}
        disabled={isDeploying || !deploymentName.trim()}
        className={`
          w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3
          ${isDeploying || !deploymentName.trim()
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#81FBA5] to-[#6de992] text-gray-900 hover:shadow-lg hover:shadow-[#81FBA5]/25'
          }
        `}
      >
        {isDeploying ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            デプロイ中...
          </>
        ) : (
          <>
            <Rocket className="w-6 h-6" />
            サーバーレスデプロイを実行
          </>
        )}
      </button>
    </div>
  );

  const renderDeploymentSuccess = () => (
    <div className="space-y-6">
      {/* 成功メッセージ */}
      <div className="bg-[#81FBA5]/10 border border-[#81FBA5] rounded-lg p-6 text-center">
        <CheckCircle className="w-16 h-16 text-[#81FBA5] mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">デプロイ完了！</h3>
        <p className="text-gray-400">モデルが本番環境にデプロイされました</p>
      </div>

      {/* デプロイメント情報 */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg divide-y divide-gray-700">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">デプロイメントID</span>
            <div className="flex items-center gap-2">
              <code className="text-[#81FBA5] font-mono text-sm">{deploymentResult?.deploymentId}</code>
              <button
                onClick={() => copyToClipboard(deploymentResult?.deploymentId || '', 'id')}
                className="p-1 hover:bg-gray-700 rounded"
              >
                {copiedField === 'id' ? (
                  <CheckCircle className="w-4 h-4 text-[#81FBA5]" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">予測サーバー</span>
            <div className="flex items-center gap-2">
              <code className="text-white font-mono text-sm">{deploymentResult?.predictionServer}</code>
              <button
                onClick={() => copyToClipboard(deploymentResult?.predictionServer || '', 'server')}
                className="p-1 hover:bg-gray-700 rounded"
              >
                {copiedField === 'server' ? (
                  <CheckCircle className="w-4 h-4 text-[#81FBA5]" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">APIエンドポイント</span>
            <div className="flex items-center gap-2">
              <code className="text-white font-mono text-xs truncate max-w-xs">
                {deploymentResult?.apiEndpoint}
              </code>
              <button
                onClick={() => copyToClipboard(deploymentResult?.apiEndpoint || '', 'api')}
                className="p-1 hover:bg-gray-700 rounded"
              >
                {copiedField === 'api' ? (
                  <CheckCircle className="w-4 h-4 text-[#81FBA5]" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">ステータス</span>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#81FBA5]" />
              <span className="text-[#81FBA5]">アクティブ</span>
            </span>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => window.open(`https://app.datarobot.com/deployments/${deploymentResult?.deploymentId}`, '_blank')}
          className="flex items-center justify-center gap-2 py-3 border border-[#81FBA5] text-[#81FBA5] rounded-lg hover:bg-[#81FBA5]/10 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          DataRobotで管理
        </button>
        <button
          onClick={onComplete}
          className="flex items-center justify-center gap-2 py-3 bg-[#81FBA5] text-gray-900 rounded-lg hover:bg-[#6de992] transition-colors font-semibold"
        >
          <CheckCircle className="w-5 h-5" />
          プロジェクト完了
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 text-sm bg-gray-700 rounded-full text-[#81FBA5]">
          ステップ 7/7
        </span>
        <h2 className="text-2xl font-bold text-white">デプロイ</h2>
        <p className="text-gray-400">
          モデルを本番環境にデプロイします
        </p>
      </div>

      {deploymentResult ? renderDeploymentSuccess() : renderDeployForm()}

      {/* ナビゲーション（デプロイ前のみ） */}
      {!deploymentResult && (
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
        </div>
      )}
    </div>
  );
};
