import type { ThemeDefinition, ModelInfo, DatasetInfo } from '@/types/automl';

// テーマ定義シートのテキスト形式出力
export function generateThemeDefinitionText(theme: ThemeDefinition): string {
  const lines = [
    '=' .repeat(60),
    'AI プロジェクト テーマ定義シート',
    '=' .repeat(60),
    '',
    `プロジェクト名: ${theme.title}`,
    `業界: ${theme.industry?.name || '-'}`,
    `ユースケース: ${theme.useCase?.name || '-'}`,
    `問題タイプ: ${theme.targetType === 'binary' ? '二値分類' : theme.targetType === 'regression' ? '回帰' : '多クラス分類'}`,
    `作成日: ${new Date(theme.createdAt).toLocaleDateString('ja-JP')}`,
    '',
    '-'.repeat(60),
    '【課題の明確化】',
    '-'.repeat(60),
    '',
    '■ 解決したい課題とアクション:',
    theme.problemStatement || '（未設定）',
    '',
    '■ 現在の業務フロー:',
    theme.currentWorkflow || '（未設定）',
    '',
    '-'.repeat(60),
    '【データ準備とモデリング】',
    '-'.repeat(60),
    '',
    '■ 予測対象（ターゲット）:',
    theme.targetVariable || theme.targetColumn || '（未設定）',
    '',
    '■ 使用するデータセット:',
    theme.datasetDescription || '（未設定）',
    '',
    '■ データソースと特徴量:',
    theme.dataSourcesAndFeatures || '（未設定）',
    '',
    '■ 予測の対象グループとサンプル数:',
    theme.targetGroupAndSampleSize || '（未設定）',
    '',
    '■ モデルがビジネス適用される条件:',
    theme.businessApplicationConditions || '（未設定）',
    '',
    '-'.repeat(60),
    '【ビジネス適用】',
    '-'.repeat(60),
    '',
    '■ 業務における実運用フロー:',
    theme.operationalWorkflow || '（未設定）',
    '',
    '■ 予測のタイプ:',
    theme.predictionType || '（未設定）',
    '',
    '■ システム連携:',
    theme.systemIntegration || '（未設定）',
    '',
    '■ 計算可能なインパクト:',
    theme.calculableImpact || '（未設定）',
    '',
    '■ 計算不可能なインパクト:',
    theme.nonCalculableImpact || '（未設定）',
    '',
    '-'.repeat(60),
    '【担当者】',
    '-'.repeat(60),
    '',
    `プロジェクトオーナー: ${theme.projectOwner || '（未設定）'}`,
    `業務オーナー: ${theme.businessOwner || '（未設定）'}`,
    `データ準備担当: ${theme.dataPreparationOwner || '（未設定）'}`,
    `モデリング担当: ${theme.modelingOwner || '（未設定）'}`,
    `意思決定者: ${theme.decisionMaker || '（未設定）'}`,
    `システム実装担当: ${theme.systemImplementer || '（未設定）'}`,
    '',
    '-'.repeat(60),
    '【スケジュール】',
    '-'.repeat(60),
    '',
    `データ準備期限: ${theme.dataPreparationDeadline || '（未設定）'}`,
    `モデリング期限: ${theme.modelingDeadline || '（未設定）'}`,
    `ビジネス適用日: ${theme.businessApplicationDate || '（未設定）'}`,
    '',
    '='.repeat(60),
  ];
  
  return lines.join('\n');
}

// プロジェクトレポートのテキスト形式出力
export function generateProjectReportText(
  theme: ThemeDefinition,
  datasetInfo: DatasetInfo | null,
  bestModel: ModelInfo | null,
  deploymentId: string | null
): string {
  const lines = [
    '='.repeat(60),
    'AI プロジェクト 完了レポート',
    '='.repeat(60),
    '',
    `レポート生成日: ${new Date().toLocaleDateString('ja-JP')} ${new Date().toLocaleTimeString('ja-JP')}`,
    '',
    '-'.repeat(60),
    '【プロジェクト概要】',
    '-'.repeat(60),
    '',
    `プロジェクト名: ${theme.title}`,
    `業界: ${theme.industry?.name || '-'}`,
    `ユースケース: ${theme.useCase?.name || '-'}`,
    `問題タイプ: ${theme.targetType === 'binary' ? '二値分類' : theme.targetType === 'regression' ? '回帰' : '多クラス分類'}`,
    '',
  ];
  
  if (datasetInfo) {
    lines.push(
      '-'.repeat(60),
      '【データセット情報】',
      '-'.repeat(60),
      '',
      `データセット名: ${datasetInfo.name}`,
      `行数: ${datasetInfo.rows.toLocaleString()}`,
      `カラム数: ${datasetInfo.columns}`,
      `ターゲット列: ${datasetInfo.targetColumn || theme.targetColumn || '（未設定）'}`,
      `特徴量: ${datasetInfo.features.join(', ')}`,
      ''
    );
  }
  
  if (bestModel) {
    lines.push(
      '-'.repeat(60),
      '【ベストモデル】',
      '-'.repeat(60),
      '',
      `モデルタイプ: ${bestModel.modelType}`,
      `モデルID: ${bestModel.modelId}`,
      '',
      '■ 評価メトリクス:',
      ''
    );
    
    if (bestModel.metrics.auc !== undefined) {
      lines.push(`  AUC: ${bestModel.metrics.auc.toFixed(4)}`);
    }
    if (bestModel.metrics.accuracy !== undefined) {
      lines.push(`  正確度: ${bestModel.metrics.accuracy.toFixed(4)}`);
    }
    if (bestModel.metrics.f1 !== undefined) {
      lines.push(`  F1スコア: ${bestModel.metrics.f1.toFixed(4)}`);
    }
    if (bestModel.metrics.precision !== undefined) {
      lines.push(`  適合率: ${bestModel.metrics.precision.toFixed(4)}`);
    }
    if (bestModel.metrics.recall !== undefined) {
      lines.push(`  再現率: ${bestModel.metrics.recall.toFixed(4)}`);
    }
    if (bestModel.metrics.rmse !== undefined) {
      lines.push(`  RMSE: ${bestModel.metrics.rmse.toFixed(4)}`);
    }
    if (bestModel.metrics.mae !== undefined) {
      lines.push(`  MAE: ${bestModel.metrics.mae.toFixed(4)}`);
    }
    if (bestModel.metrics.r2 !== undefined) {
      lines.push(`  R²: ${bestModel.metrics.r2.toFixed(4)}`);
    }
    
    lines.push('');
  }
  
  if (deploymentId) {
    lines.push(
      '-'.repeat(60),
      '【デプロイメント情報】',
      '-'.repeat(60),
      '',
      `デプロイメントID: ${deploymentId}`,
      `ステータス: アクティブ`,
      `DataRobot URL: https://app.datarobot.com/deployments/${deploymentId}`,
      ''
    );
  }
  
  lines.push(
    '-'.repeat(60),
    '【ビジネスインパクト】',
    '-'.repeat(60),
    '',
    '■ 計算可能なインパクト:',
    theme.calculableImpact || '（未設定）',
    '',
    '■ 計算不可能なインパクト:',
    theme.nonCalculableImpact || '（未設定）',
    '',
    '='.repeat(60),
    'このレポートはAutoML Assistantによって自動生成されました',
    '='.repeat(60)
  );
  
  return lines.join('\n');
}

// テキストファイルをダウンロード
export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// テーマ定義シートをダウンロード
export function downloadThemeDefinition(theme: ThemeDefinition): void {
  const content = generateThemeDefinitionText(theme);
  const filename = `テーマ定義シート_${theme.title || 'untitled'}_${new Date().toISOString().slice(0, 10)}.txt`;
  downloadTextFile(content, filename);
}

// プロジェクトレポートをダウンロード
export function downloadProjectReport(
  theme: ThemeDefinition,
  datasetInfo: DatasetInfo | null,
  bestModel: ModelInfo | null,
  deploymentId: string | null
): void {
  const content = generateProjectReportText(theme, datasetInfo, bestModel, deploymentId);
  const filename = `プロジェクトレポート_${theme.title || 'untitled'}_${new Date().toISOString().slice(0, 10)}.txt`;
  downloadTextFile(content, filename);
}
