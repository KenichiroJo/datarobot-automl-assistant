// AutoML Assistant 型定義

export type WorkflowStep = 
  | 'theme'
  | 'data'
  | 'prepare'
  | 'build'
  | 'accuracy'
  | 'test'
  | 'deploy';

export interface WorkflowStepInfo {
  id: WorkflowStep;
  number: number;
  label: string;
  icon: string;
  description: string;
}

export const WORKFLOW_STEPS: WorkflowStepInfo[] = [
  { id: 'theme', number: 1, label: 'テーマ', icon: '🎯', description: 'テーマ定義' },
  { id: 'data', number: 2, label: 'データ', icon: '📊', description: 'データ準備' },
  { id: 'prepare', number: 3, label: '整形', icon: '🔧', description: 'データ整形・EDA' },
  { id: 'build', number: 4, label: '構築', icon: '🏗️', description: 'モデル構築' },
  { id: 'accuracy', number: 5, label: '精度', icon: '📈', description: '精度確認' },
  { id: 'test', number: 6, label: 'テスト', icon: '🧪', description: 'テスト予測' },
  { id: 'deploy', number: 7, label: 'デプロイ', icon: '🚀', description: 'デプロイ' },
];

export interface UseCase {
  id: string;
  name: string;
  target_type: 'binary' | 'regression' | 'multiclass';
  description: string;
}

export interface Industry {
  id: string;
  name: string;
  emoji: string;
  use_cases: UseCase[];
}

export const INDUSTRIES: Industry[] = [
  {
    id: 'retail',
    name: '小売・EC',
    emoji: '🛒',
    use_cases: [
      { id: 'churn', name: '顧客離反予測', target_type: 'binary', description: '顧客が離反するかどうかを予測' },
      { id: 'demand', name: '需要予測', target_type: 'regression', description: '商品の需要量を予測' },
      { id: 'recommendation', name: 'レコメンデーション', target_type: 'binary', description: '顧客への商品推薦' },
      { id: 'pricing', name: '価格最適化', target_type: 'regression', description: '最適な価格設定を予測' },
      { id: 'inventory', name: '在庫最適化', target_type: 'regression', description: '最適な在庫量を予測' },
    ],
  },
  {
    id: 'finance',
    name: '金融・保険',
    emoji: '🏦',
    use_cases: [
      { id: 'credit_score', name: '与信スコアリング', target_type: 'binary', description: '融資の可否を予測' },
      { id: 'fraud', name: '不正検知', target_type: 'binary', description: '不正取引を検知' },
      { id: 'claim', name: '保険請求予測', target_type: 'regression', description: '保険請求額を予測' },
      { id: 'ltv', name: '顧客LTV予測', target_type: 'regression', description: '顧客生涯価値を予測' },
      { id: 'market', name: 'マーケット予測', target_type: 'regression', description: '市場動向を予測' },
    ],
  },
  {
    id: 'manufacturing',
    name: '製造業',
    emoji: '🏭',
    use_cases: [
      { id: 'quality', name: '品質予測', target_type: 'binary', description: '製品品質の良否を予測' },
      { id: 'maintenance', name: '予知保全', target_type: 'binary', description: '機器故障を予測' },
      { id: 'demand', name: '需要予測', target_type: 'regression', description: '製品需要を予測' },
      { id: 'yield', name: '歩留まり最適化', target_type: 'regression', description: '歩留まり率を予測' },
      { id: 'anomaly', name: '異常検知', target_type: 'binary', description: '異常値を検知' },
    ],
  },
  {
    id: 'healthcare',
    name: 'ヘルスケア',
    emoji: '🏥',
    use_cases: [
      { id: 'readmission', name: '再入院予測', target_type: 'binary', description: '患者の再入院リスクを予測' },
      { id: 'diagnosis', name: '診断支援', target_type: 'multiclass', description: '疾患の診断を支援' },
      { id: 'risk', name: '患者リスク予測', target_type: 'binary', description: '患者のリスクレベルを予測' },
      { id: 'drug', name: '薬効予測', target_type: 'regression', description: '薬の効果を予測' },
      { id: 'resource', name: 'リソース最適化', target_type: 'regression', description: '医療リソースを最適化' },
    ],
  },
  {
    id: 'hr',
    name: '人事・HR',
    emoji: '👥',
    use_cases: [
      { id: 'attrition', name: '離職予測', target_type: 'binary', description: '従業員の離職リスクを予測' },
      { id: 'hiring', name: '採用成功予測', target_type: 'binary', description: '採用の成功確率を予測' },
      { id: 'performance', name: 'パフォーマンス予測', target_type: 'regression', description: '従業員のパフォーマンスを予測' },
      { id: 'engagement', name: 'エンゲージメント予測', target_type: 'regression', description: '従業員エンゲージメントを予測' },
      { id: 'placement', name: '最適配置', target_type: 'multiclass', description: '最適な人員配置を予測' },
    ],
  },
  {
    id: 'automotive',
    name: '自動車',
    emoji: '🚗',
    use_cases: [
      { id: 'failure', name: '故障予測', target_type: 'binary', description: '車両故障を予測' },
      { id: 'demand', name: '需要予測', target_type: 'regression', description: '車両需要を予測' },
      { id: 'quality', name: '品質予測', target_type: 'binary', description: '部品品質を予測' },
      { id: 'churn', name: '顧客離反予測', target_type: 'binary', description: '顧客離反を予測' },
      { id: 'parts_life', name: '部品寿命予測', target_type: 'regression', description: '部品の寿命を予測' },
    ],
  },
  {
    id: 'transportation',
    name: '鉄道・運輸',
    emoji: '🚆',
    use_cases: [
      { id: 'delay', name: '遅延予測', target_type: 'regression', description: '遅延時間を予測' },
      { id: 'demand', name: '需要予測', target_type: 'regression', description: '乗客需要を予測' },
      { id: 'maintenance', name: '保守最適化', target_type: 'binary', description: '保守タイミングを予測' },
      { id: 'safety', name: '安全リスク予測', target_type: 'binary', description: '安全リスクを予測' },
      { id: 'flow', name: '乗客流動予測', target_type: 'regression', description: '乗客の流動を予測' },
    ],
  },
  {
    id: 'staffing',
    name: '人材サービス',
    emoji: '💼',
    use_cases: [
      { id: 'matching', name: 'マッチング最適化', target_type: 'binary', description: '求人と求職者のマッチングを予測' },
      { id: 'attrition', name: '離職予測', target_type: 'binary', description: '派遣社員の離職を予測' },
      { id: 'success', name: '求人成功予測', target_type: 'binary', description: '求人の成功確率を予測' },
      { id: 'skill_demand', name: 'スキル需要予測', target_type: 'regression', description: 'スキル需要を予測' },
      { id: 'salary', name: '報酬最適化', target_type: 'regression', description: '最適な報酬を予測' },
    ],
  },
  {
    id: 'realestate',
    name: '不動産',
    emoji: '🏠',
    use_cases: [
      { id: 'price', name: '価格予測', target_type: 'regression', description: '不動産価格を予測' },
      { id: 'demand', name: '需要予測', target_type: 'regression', description: '物件需要を予測' },
      { id: 'vacancy', name: '空室予測', target_type: 'binary', description: '空室リスクを予測' },
      { id: 'matching', name: '顧客マッチング', target_type: 'binary', description: '顧客と物件のマッチングを予測' },
      { id: 'roi', name: '投資収益予測', target_type: 'regression', description: '投資収益を予測' },
    ],
  },
  {
    id: 'food_beverage',
    name: '飲料・食品',
    emoji: '🍔',
    use_cases: [
      { id: 'demand', name: '需要予測', target_type: 'regression', description: '商品需要を予測' },
      { id: 'quality', name: '品質管理', target_type: 'binary', description: '品質の良否を予測' },
      { id: 'shelf_life', name: '賞味期限最適化', target_type: 'regression', description: '最適な賞味期限を予測' },
      { id: 'material_price', name: '原材料価格予測', target_type: 'regression', description: '原材料価格を予測' },
      { id: 'new_product', name: '新商品成功予測', target_type: 'binary', description: '新商品の成功確率を予測' },
    ],
  },
  {
    id: 'marketing',
    name: 'マーケティング',
    emoji: '📢',
    use_cases: [
      { id: 'campaign', name: 'キャンペーン効果予測', target_type: 'regression', description: 'キャンペーンの効果を予測' },
      { id: 'segment', name: '顧客セグメント', target_type: 'multiclass', description: '顧客をセグメント分類' },
      { id: 'ltv', name: 'LTV予測', target_type: 'regression', description: '顧客生涯価値を予測' },
      { id: 'channel', name: 'チャネル最適化', target_type: 'multiclass', description: '最適なチャネルを予測' },
      { id: 'conversion', name: 'コンバージョン予測', target_type: 'binary', description: 'コンバージョン確率を予測' },
    ],
  },
  {
    id: 'backoffice',
    name: 'バックオフィス',
    emoji: '📋',
    use_cases: [
      { id: 'expense_anomaly', name: '経費異常検知', target_type: 'binary', description: '経費の異常を検知' },
      { id: 'invoice', name: '請求書処理自動化', target_type: 'multiclass', description: '請求書のカテゴリを分類' },
      { id: 'cashflow', name: 'キャッシュフロー予測', target_type: 'regression', description: 'キャッシュフローを予測' },
      { id: 'workload', name: '業務負荷予測', target_type: 'regression', description: '業務負荷を予測' },
      { id: 'approval_time', name: '承認時間予測', target_type: 'regression', description: '承認にかかる時間を予測' },
    ],
  },
];

export interface ThemeDefinition {
  title: string;
  industry?: Industry;
  useCase?: UseCase;
  targetType: 'binary' | 'regression' | 'multiclass';
  targetColumn?: string;
  
  // 課題の明確化
  problemStatement: string;
  currentWorkflow: string;
  
  // データ準備とモデリング
  targetVariable: string;
  datasetDescription: string;
  dataSourcesAndFeatures: string;
  targetGroupAndSampleSize: string;
  businessApplicationConditions: string;
  
  // ビジネス適用
  operationalWorkflow: string;
  predictionType: string;
  systemIntegration: string;
  calculableImpact: string;
  nonCalculableImpact: string;
  
  // 担当者情報
  projectOwner: string;
  businessOwner: string;
  dataPreparationOwner: string;
  modelingOwner: string;
  decisionMaker: string;
  systemImplementer: string;
  
  // 日程
  dataPreparationDeadline: string;
  modelingDeadline: string;
  businessApplicationDate: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ModelInfo {
  modelId: string;
  modelType: string;
  metrics: {
    auc?: number;
    accuracy?: number;
    f1?: number;
    precision?: number;
    recall?: number;
    rmse?: number;
    mae?: number;
    r2?: number;
  };
  sampleSize?: number;
  features?: number;
  featureImpact?: FeatureImpact[];
}

export interface FeatureImpact {
  featureName: string;
  impactNormalized: number;
  impactUnnormalized: number;
}

export interface DatasetInfo {
  datasetId: string;
  name: string;
  rows: number;
  columns: number;
  features: string[];
  targetColumn?: string;
  uploadedAt?: string;
}

export interface ROCCurveData {
  fpr: number[];
  tpr: number[];
  thresholds: number[];
  auc: number;
}

export interface LiftChartData {
  bins: number[];
  actual: number[];
  predicted: number[];
}
