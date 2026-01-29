/**
 * DataRobot MCPツール接続テストユーティリティ
 * エージェント経由でDataRobot APIとの接続を確認
 */
import { agentClient, Message, AutoMLPrompts } from './agent-api';

export interface MCPToolTestResult {
  toolName: string;
  success: boolean;
  message: string;
  response?: unknown;
  duration: number;
}

export interface DataRobotConnectionStatus {
  connected: boolean;
  aiCatalogAccess: boolean;
  projectsAccess: boolean;
  deploymentsAccess: boolean;
  errors: string[];
}

/**
 * MCPツールのテストを実行
 */
export async function testMCPToolConnection(
  toolName: string,
  testPrompt: string
): Promise<MCPToolTestResult> {
  const startTime = Date.now();
  
  try {
    const response = await agentClient.sendMessageSync(testPrompt);
    const duration = Date.now() - startTime;
    
    return {
      toolName,
      success: true,
      message: `Tool ${toolName} responded successfully`,
      response: response.content,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      toolName,
      success: false,
      message: error instanceof Error ? error.message : String(error),
      duration,
    };
  }
}

/**
 * DataRobot接続の総合テスト
 */
export async function testDataRobotConnection(): Promise<DataRobotConnectionStatus> {
  const status: DataRobotConnectionStatus = {
    connected: false,
    aiCatalogAccess: false,
    projectsAccess: false,
    deploymentsAccess: false,
    errors: [],
  };

  // 基本接続テスト
  try {
    const threadId = await agentClient.createThread();
    status.connected = !!threadId;
  } catch (error) {
    status.errors.push(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
    return status;
  }

  // AIカタログアクセステスト
  try {
    const result = await testMCPToolConnection(
      'list_ai_catalog_datasets',
      'AIカタログにあるデータセットの一覧を表示してください。'
    );
    status.aiCatalogAccess = result.success;
    if (!result.success) {
      status.errors.push(`AI Catalog: ${result.message}`);
    }
  } catch (error) {
    status.errors.push(`AI Catalog test failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // プロジェクトアクセステスト
  try {
    const result = await testMCPToolConnection(
      'list_projects',
      '既存のDataRobotプロジェクトの一覧を表示してください。'
    );
    status.projectsAccess = result.success;
    if (!result.success) {
      status.errors.push(`Projects: ${result.message}`);
    }
  } catch (error) {
    status.errors.push(`Projects test failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // デプロイメントアクセステスト
  try {
    const result = await testMCPToolConnection(
      'list_deployments',
      '既存のDataRobotデプロイメントの一覧を表示してください。'
    );
    status.deploymentsAccess = result.success;
    if (!result.success) {
      status.errors.push(`Deployments: ${result.message}`);
    }
  } catch (error) {
    status.errors.push(`Deployments test failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return status;
}

/**
 * AutoMLワークフローの主要MCPツールをテスト
 */
export async function testAutoMLWorkflowTools(): Promise<MCPToolTestResult[]> {
  const tests: { name: string; prompt: string }[] = [
    {
      name: 'list_ai_catalog_datasets',
      prompt: 'AIカタログで利用可能なデータセットを確認してください。',
    },
    {
      name: 'get_project_info',
      prompt: '現在のプロジェクト情報を取得してください。（利用可能な場合）',
    },
    {
      name: 'get_best_model',
      prompt: '最良のモデルの情報を取得する方法を教えてください。',
    },
    {
      name: 'get_feature_impact',
      prompt: '特徴量重要度の取得方法について説明してください。',
    },
    {
      name: 'deploy_model',
      prompt: 'モデルをデプロイする手順を説明してください。',
    },
  ];

  const results: MCPToolTestResult[] = [];

  for (const test of tests) {
    const result = await testMCPToolConnection(test.name, test.prompt);
    results.push(result);
    
    // レート制限を考慮して少し待機
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * 接続状態を表示用にフォーマット
 */
export function formatConnectionStatus(status: DataRobotConnectionStatus): string {
  const lines = [
    `DataRobot接続状態:`,
    `  ✓ 基本接続: ${status.connected ? '成功' : '失敗'}`,
    `  ${status.aiCatalogAccess ? '✓' : '✗'} AIカタログ: ${status.aiCatalogAccess ? '利用可能' : '利用不可'}`,
    `  ${status.projectsAccess ? '✓' : '✗'} プロジェクト: ${status.projectsAccess ? '利用可能' : '利用不可'}`,
    `  ${status.deploymentsAccess ? '✓' : '✗'} デプロイメント: ${status.deploymentsAccess ? '利用可能' : '利用不可'}`,
  ];

  if (status.errors.length > 0) {
    lines.push('', 'エラー:');
    status.errors.forEach(err => lines.push(`  - ${err}`));
  }

  return lines.join('\n');
}

/**
 * テスト結果のサマリーを生成
 */
export function summarizeTestResults(results: MCPToolTestResult[]): {
  total: number;
  passed: number;
  failed: number;
  avgDuration: number;
} {
  const passed = results.filter(r => r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    avgDuration: results.length > 0 ? totalDuration / results.length : 0,
  };
}

// AutoMLPrompts を再エクスポート
export { AutoMLPrompts };
