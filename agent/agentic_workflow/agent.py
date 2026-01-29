# Copyright 2025 DataRobot, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""
AutoML Assistant Agent - DataRobot AutoML/MLOps統合エージェント

機械学習プロジェクトを推進するユーザーを支援するエージェント。
テーマ定義からデプロイまでの全工程をサポートする。
"""
from datetime import datetime
from typing import Any

from config import Config
from datarobot_genai.core.agents import make_system_prompt
from datarobot_genai.langgraph.agent import LangGraphAgent
from langchain_core.prompts import ChatPromptTemplate
from langchain_litellm.chat_models import ChatLiteLLM
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import create_react_agent

config = Config()

# 業界・ユースケースデータ
INDUSTRIES = {
    "retail": {
        "name": "小売・EC",
        "emoji": "🛒",
        "use_cases": [
            {"id": "churn", "name": "顧客離反予測", "target_type": "binary", "description": "顧客が離反するかどうかを予測"},
            {"id": "demand", "name": "需要予測", "target_type": "regression", "description": "商品の需要量を予測"},
            {"id": "recommendation", "name": "レコメンデーション", "target_type": "binary", "description": "顧客への商品推薦"},
            {"id": "pricing", "name": "価格最適化", "target_type": "regression", "description": "最適な価格設定を予測"},
            {"id": "inventory", "name": "在庫最適化", "target_type": "regression", "description": "最適な在庫量を予測"},
        ]
    },
    "finance": {
        "name": "金融・保険",
        "emoji": "🏦",
        "use_cases": [
            {"id": "credit_score", "name": "与信スコアリング", "target_type": "binary", "description": "融資の可否を予測"},
            {"id": "fraud", "name": "不正検知", "target_type": "binary", "description": "不正取引を検知"},
            {"id": "claim", "name": "保険請求予測", "target_type": "regression", "description": "保険請求額を予測"},
            {"id": "ltv", "name": "顧客LTV予測", "target_type": "regression", "description": "顧客生涯価値を予測"},
            {"id": "market", "name": "マーケット予測", "target_type": "regression", "description": "市場動向を予測"},
        ]
    },
    "manufacturing": {
        "name": "製造業",
        "emoji": "🏭",
        "use_cases": [
            {"id": "quality", "name": "品質予測", "target_type": "binary", "description": "製品品質の良否を予測"},
            {"id": "maintenance", "name": "予知保全", "target_type": "binary", "description": "機器故障を予測"},
            {"id": "demand", "name": "需要予測", "target_type": "regression", "description": "製品需要を予測"},
            {"id": "yield", "name": "歩留まり最適化", "target_type": "regression", "description": "歩留まり率を予測"},
            {"id": "anomaly", "name": "異常検知", "target_type": "binary", "description": "異常値を検知"},
        ]
    },
    "healthcare": {
        "name": "ヘルスケア",
        "emoji": "🏥",
        "use_cases": [
            {"id": "readmission", "name": "再入院予測", "target_type": "binary", "description": "患者の再入院リスクを予測"},
            {"id": "diagnosis", "name": "診断支援", "target_type": "multiclass", "description": "疾患の診断を支援"},
            {"id": "risk", "name": "患者リスク予測", "target_type": "binary", "description": "患者のリスクレベルを予測"},
            {"id": "drug", "name": "薬効予測", "target_type": "regression", "description": "薬の効果を予測"},
            {"id": "resource", "name": "リソース最適化", "target_type": "regression", "description": "医療リソースを最適化"},
        ]
    },
    "hr": {
        "name": "人事・HR",
        "emoji": "👥",
        "use_cases": [
            {"id": "attrition", "name": "離職予測", "target_type": "binary", "description": "従業員の離職リスクを予測"},
            {"id": "hiring", "name": "採用成功予測", "target_type": "binary", "description": "採用の成功確率を予測"},
            {"id": "performance", "name": "パフォーマンス予測", "target_type": "regression", "description": "従業員のパフォーマンスを予測"},
            {"id": "engagement", "name": "エンゲージメント予測", "target_type": "regression", "description": "従業員エンゲージメントを予測"},
            {"id": "placement", "name": "最適配置", "target_type": "multiclass", "description": "最適な人員配置を予測"},
        ]
    },
    "automotive": {
        "name": "自動車",
        "emoji": "🚗",
        "use_cases": [
            {"id": "failure", "name": "故障予測", "target_type": "binary", "description": "車両故障を予測"},
            {"id": "demand", "name": "需要予測", "target_type": "regression", "description": "車両需要を予測"},
            {"id": "quality", "name": "品質予測", "target_type": "binary", "description": "部品品質を予測"},
            {"id": "churn", "name": "顧客離反予測", "target_type": "binary", "description": "顧客離反を予測"},
            {"id": "parts_life", "name": "部品寿命予測", "target_type": "regression", "description": "部品の寿命を予測"},
        ]
    },
    "transportation": {
        "name": "鉄道・運輸",
        "emoji": "🚆",
        "use_cases": [
            {"id": "delay", "name": "遅延予測", "target_type": "regression", "description": "遅延時間を予測"},
            {"id": "demand", "name": "需要予測", "target_type": "regression", "description": "乗客需要を予測"},
            {"id": "maintenance", "name": "保守最適化", "target_type": "binary", "description": "保守タイミングを予測"},
            {"id": "safety", "name": "安全リスク予測", "target_type": "binary", "description": "安全リスクを予測"},
            {"id": "flow", "name": "乗客流動予測", "target_type": "regression", "description": "乗客の流動を予測"},
        ]
    },
    "staffing": {
        "name": "人材サービス",
        "emoji": "💼",
        "use_cases": [
            {"id": "matching", "name": "マッチング最適化", "target_type": "binary", "description": "求人と求職者のマッチングを予測"},
            {"id": "attrition", "name": "離職予測", "target_type": "binary", "description": "派遣社員の離職を予測"},
            {"id": "success", "name": "求人成功予測", "target_type": "binary", "description": "求人の成功確率を予測"},
            {"id": "skill_demand", "name": "スキル需要予測", "target_type": "regression", "description": "スキル需要を予測"},
            {"id": "salary", "name": "報酬最適化", "target_type": "regression", "description": "最適な報酬を予測"},
        ]
    },
    "realestate": {
        "name": "不動産",
        "emoji": "🏠",
        "use_cases": [
            {"id": "price", "name": "価格予測", "target_type": "regression", "description": "不動産価格を予測"},
            {"id": "demand", "name": "需要予測", "target_type": "regression", "description": "物件需要を予測"},
            {"id": "vacancy", "name": "空室予測", "target_type": "binary", "description": "空室リスクを予測"},
            {"id": "matching", "name": "顧客マッチング", "target_type": "binary", "description": "顧客と物件のマッチングを予測"},
            {"id": "roi", "name": "投資収益予測", "target_type": "regression", "description": "投資収益を予測"},
        ]
    },
    "food_beverage": {
        "name": "飲料・食品",
        "emoji": "🍔",
        "use_cases": [
            {"id": "demand", "name": "需要予測", "target_type": "regression", "description": "商品需要を予測"},
            {"id": "quality", "name": "品質管理", "target_type": "binary", "description": "品質の良否を予測"},
            {"id": "shelf_life", "name": "賞味期限最適化", "target_type": "regression", "description": "最適な賞味期限を予測"},
            {"id": "material_price", "name": "原材料価格予測", "target_type": "regression", "description": "原材料価格を予測"},
            {"id": "new_product", "name": "新商品成功予測", "target_type": "binary", "description": "新商品の成功確率を予測"},
        ]
    },
    "marketing": {
        "name": "マーケティング",
        "emoji": "📢",
        "use_cases": [
            {"id": "campaign", "name": "キャンペーン効果予測", "target_type": "regression", "description": "キャンペーンの効果を予測"},
            {"id": "segment", "name": "顧客セグメント", "target_type": "multiclass", "description": "顧客をセグメント分類"},
            {"id": "ltv", "name": "LTV予測", "target_type": "regression", "description": "顧客生涯価値を予測"},
            {"id": "channel", "name": "チャネル最適化", "target_type": "multiclass", "description": "最適なチャネルを予測"},
            {"id": "conversion", "name": "コンバージョン予測", "target_type": "binary", "description": "コンバージョン確率を予測"},
        ]
    },
    "backoffice": {
        "name": "バックオフィス",
        "emoji": "📋",
        "use_cases": [
            {"id": "expense_anomaly", "name": "経費異常検知", "target_type": "binary", "description": "経費の異常を検知"},
            {"id": "invoice", "name": "請求書処理自動化", "target_type": "multiclass", "description": "請求書のカテゴリを分類"},
            {"id": "cashflow", "name": "キャッシュフロー予測", "target_type": "regression", "description": "キャッシュフローを予測"},
            {"id": "workload", "name": "業務負荷予測", "target_type": "regression", "description": "業務負荷を予測"},
            {"id": "approval_time", "name": "承認時間予測", "target_type": "regression", "description": "承認にかかる時間を予測"},
        ]
    },
}


class AutoMLAssistantAgent(LangGraphAgent):
    """
    AutoML Assistant Agent - DataRobot AutoML/MLOps統合エージェント
    
    機械学習プロジェクトを推進するユーザーを支援するエージェント。
    7つのステップでテーマ定義からデプロイまでをサポート：
    1. テーマ定義
    2. データ準備
    3. データ整形・EDA
    4. モデル構築
    5. 精度確認
    6. テスト予測
    7. デプロイ
    """

    @property
    def workflow(self) -> StateGraph[MessagesState]:
        """シンプルなReActワークフロー"""
        langgraph_workflow = StateGraph[
            MessagesState, None, MessagesState, MessagesState
        ](MessagesState)
        langgraph_workflow.add_node("agent", self.agent)
        langgraph_workflow.add_edge(START, "agent")
        langgraph_workflow.add_edge("agent", END)
        return langgraph_workflow  # type: ignore[return-value]

    @property
    def prompt_template(self) -> ChatPromptTemplate:
        """ユーザー入力を受け取るテンプレート"""
        return ChatPromptTemplate.from_messages(
            [
                (
                    "user",
                    "{input}",
                ),
            ]
        )

    def llm(
        self,
        preferred_model: str | None = None,
        auto_model_override: bool = True,
    ) -> ChatLiteLLM:
        """Returns the ChatLiteLLM to use for a given model."""
        api_base = self.litellm_api_base(config.llm_deployment_id)
        model = preferred_model
        if preferred_model is None:
            model = config.llm_default_model
        if auto_model_override and not config.use_datarobot_llm_gateway:
            model = config.llm_default_model
        if self.verbose:
            print(f"Using model: {model}")
        return ChatLiteLLM(
            model=model,
            api_base=api_base,
            api_key=self.api_key,
            timeout=self.timeout,
            streaming=True,
            max_retries=3,
        )

    @property
    def agent(self) -> Any:
        """ReActパターンでMCPツールを活用するエージェント"""
        return create_react_agent(
            self.llm(preferred_model="datarobot/azure/gpt-4o-2024-11-20"),
            tools=self.mcp_tools,
            prompt=make_system_prompt(self._get_system_prompt()),
            name="AutoML Assistant",
        )

    def _get_system_prompt(self) -> str:
        """システムプロンプトを生成"""
        current_date = datetime.now().strftime("%Y年%m月%d日")
        
        industries_info = "\n".join([
            f"- {data['emoji']} {data['name']} ({key}): {', '.join([uc['name'] for uc in data['use_cases']])}"
            for key, data in INDUSTRIES.items()
        ])
        
        return f"""あなたは「AutoML Assistant」です。DataRobotプラットフォームを活用して、
機械学習プロジェクトを推進するユーザーを支援する専門エージェントです。
現在の日付は{current_date}です。

## あなたの役割

ユーザーがAIプロジェクトを成功させるために、以下の7ステップでサポートします：

### ステップ1: テーマ定義
- ユーザーの業界とユースケースをヒアリング
- 解決したい課題を明確化
- 予測対象（ターゲット）を定義
- データ要件を整理
- ビジネス適用条件を確認

### ステップ2: データ準備
- ユースケースに応じたサンプルデータを提案
- ユーザーがアップロードしたデータをDataRobotのAI Catalogに登録
- MCPツール: upload_dataset_to_ai_catalog

### ステップ3: データ整形・EDA
- データセットの分析と探索
- 特徴量の確認と品質チェック
- MCPツール: analyze_dataset, get_exploratory_insights

### ステップ4: モデル構築
- Autopilotの設定と実行
- ターゲット、問題タイプ、メトリックなどを自然言語で設定
- MCPツール: start_autopilot, list_projects

### ステップ5: 精度確認
- Leaderboardでモデル一覧を確認
- Feature Impact、ROC曲線、Lift Chartなどで分析
- データサイエンティストとしてアドバイス
- MCPツール: get_best_model, list_models, get_model_feature_impact, get_model_roc_curve, get_model_lift_chart

### ステップ6: テスト予測
- テストデータで予測を実行
- 予測結果を分析
- MCPツール: predict_realtime, predict_by_file_path, validate_prediction_data

### ステップ7: デプロイ
- サーバーレスデプロイメントを実行
- デプロイメント情報の確認
- MCPツール: deploy_model, list_deployments, get_deployment_info

## 利用可能な業界とユースケース

{industries_info}

## 対話ガイドライン

1. **親切で専門的**: データサイエンティストとして、専門知識を分かりやすく説明
2. **段階的に進める**: ユーザーの理解度に合わせて一歩ずつ進める
3. **確認を怠らない**: 重要な決定は必ずユーザーに確認
4. **具体的な提案**: 抽象的ではなく具体的な選択肢を提示
5. **エラー対応**: 問題が発生した場合は原因と対策を説明

## テーマ定義シートの項目

テーマ定義時は以下の項目を整理します：

### 課題の明確化
- 解決したい課題とアクション
- 現在の業務フロー

### データ準備とモデリング
- 予測対象（ターゲット）
- 使用するデータセット
- データソースと特徴量
- 予測の対象グループとサンプル数
- モデルがビジネス適用される条件

### ビジネス適用
- 業務における実運用フロー
- 予測のタイプ
- システム連携
- 計算可能なインパクト
- 計算不可能なインパクト

## 出力フォーマット

構造化されたデータを返す際は、必ずJSON形式で出力してください。
例えば、テーマ定義の結果は以下の形式で出力します：

```json
{{
  "theme_definition": {{
    "title": "プロジェクトタイトル",
    "industry": "業界",
    "use_case": "ユースケース",
    "problem_statement": "解決したい課題",
    "current_workflow": "現在の業務フロー",
    "target_variable": "予測対象",
    "data_requirements": "データ要件",
    "business_conditions": "ビジネス適用条件",
    "expected_impact": "期待されるインパクト"
  }}
}}
```

ユーザーのリクエストに応じて、適切なMCPツールを使用してDataRobotプラットフォームと連携してください。
"""


# エイリアスとして元のクラス名も保持（後方互換性のため）
MyAgent = AutoMLAssistantAgent
