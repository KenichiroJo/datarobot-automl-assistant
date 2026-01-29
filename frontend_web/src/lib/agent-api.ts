/**
 * エージェントAPI接続ライブラリ
 * AG-UIプロトコルを使用してエージェントと通信
 */

// イベントタイプ
export type AgentEventType =
  | 'TEXT_MESSAGE_START'
  | 'TEXT_MESSAGE_CONTENT'
  | 'TEXT_MESSAGE_END'
  | 'TOOL_CALL_START'
  | 'TOOL_CALL_ARGS'
  | 'TOOL_CALL_END'
  | 'STATE_SNAPSHOT'
  | 'STATE_DELTA'
  | 'MESSAGES_SNAPSHOT'
  | 'RUN_STARTED'
  | 'RUN_FINISHED'
  | 'RUN_ERROR';

export interface AgentEvent {
  type: AgentEventType;
  messageId?: string;
  content?: string;
  toolCallId?: string;
  toolCallName?: string;
  args?: string;
  snapshot?: unknown;
  delta?: unknown;
  error?: string;
  runId?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
}

export interface AgentRunOptions {
  threadId?: string;
  stream?: boolean;
  onEvent?: (event: AgentEvent) => void;
  onMessage?: (message: Message) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * エージェントAPIクライアント
 */
export class AgentClient {
  private baseUrl: string;
  private abortController: AbortController | null = null;

  constructor(baseUrl = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * 新しいスレッドを作成
   */
  async createThread(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `AutoML Session ${new Date().toISOString()}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create thread: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * メッセージを送信してストリーミング応答を受信
   */
  async sendMessage(
    content: string,
    options: AgentRunOptions = {}
  ): Promise<void> {
    const { threadId, onEvent, onMessage, onError, onComplete } = options;

    // 既存のリクエストをキャンセル
    this.abort();
    this.abortController = new AbortController();

    try {
      // スレッドIDがない場合は新規作成
      const activeThreadId = threadId || await this.createThread();

      const response = await fetch(`${this.baseUrl}/ag-ui/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          thread_id: activeThreadId,
          messages: [
            {
              role: 'user',
              content,
            },
          ],
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      // Server-Sent Events の読み取り
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentMessage: Partial<Message> = {};
      let currentContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // 最終メッセージを送信
              if (currentMessage.id && currentContent) {
                onMessage?.({
                  id: currentMessage.id,
                  role: 'assistant',
                  content: currentContent,
                  createdAt: new Date(),
                });
              }
              onComplete?.();
              return;
            }

            try {
              const event = JSON.parse(data) as AgentEvent;
              onEvent?.(event);

              // イベントタイプに応じた処理
              switch (event.type) {
                case 'TEXT_MESSAGE_START':
                  currentMessage = {
                    id: event.messageId || crypto.randomUUID(),
                    role: 'assistant',
                  };
                  currentContent = '';
                  break;

                case 'TEXT_MESSAGE_CONTENT':
                  currentContent += event.content || '';
                  break;

                case 'TEXT_MESSAGE_END':
                  if (currentMessage.id) {
                    onMessage?.({
                      id: currentMessage.id,
                      role: 'assistant',
                      content: currentContent,
                      createdAt: new Date(),
                    });
                  }
                  currentMessage = {};
                  currentContent = '';
                  break;

                case 'RUN_ERROR':
                  onError?.(new Error(event.error || 'Unknown error'));
                  break;

                case 'RUN_FINISHED':
                  onComplete?.();
                  break;
              }
            } catch {
              // JSON parse error - skip this line
              console.warn('Failed to parse event:', data);
            }
          }
        }
      }

      onComplete?.();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // リクエストがキャンセルされた
        return;
      }
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * 非ストリーミングでメッセージを送信
   */
  async sendMessageSync(content: string, threadId?: string): Promise<Message> {
    const activeThreadId = threadId || await this.createThread();

    const response = await fetch(`${this.baseUrl}/ag-ui/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        thread_id: activeThreadId,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.message_id || crypto.randomUUID(),
      role: 'assistant',
      content: data.content || data.response || '',
      createdAt: new Date(),
    };
  }

  /**
   * 進行中のリクエストをキャンセル
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * スレッドの履歴を取得
   */
  async getThreadHistory(threadId: string): Promise<Message[]> {
    const response = await fetch(`${this.baseUrl}/chats/${threadId}/messages`);

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.messages || data || []).map((msg: Record<string, unknown>) => ({
      id: msg.id as string || crypto.randomUUID(),
      role: msg.role as Message['role'],
      content: msg.content as string,
      createdAt: new Date(msg.created_at as string || Date.now()),
    }));
  }
}

// デフォルトのクライアントインスタンス
export const agentClient = new AgentClient();

/**
 * AutoML固有のプロンプト生成ヘルパー
 */
export const AutoMLPrompts = {
  /**
   * テーマ定義の支援リクエスト
   */
  helpDefineTheme(industry: string, useCase: string): string {
    return `${industry}業界の「${useCase}」ユースケースについて、AIプロジェクトのテーマ定義を支援してください。以下の観点でアドバイスをお願いします：
1. 解決すべき課題の明確化
2. 必要なデータの特定
3. ターゲット変数の設定
4. 期待されるビジネスインパクト`;
  },

  /**
   * データ準備の支援リクエスト
   */
  helpPrepareData(dataDescription: string): string {
    return `以下のデータについて、モデリングのための準備を支援してください：
${dataDescription}

データクレンジング、特徴量エンジニアリング、データ分割について具体的なアドバイスをお願いします。`;
  },

  /**
   * モデル構築の設定支援
   */
  helpConfigureAutopilot(targetType: string, targetColumn: string): string {
    return `${targetType === 'binary' ? '二値分類' : targetType === 'regression' ? '回帰' : '多クラス分類'}問題のAutopilot設定について支援してください。
ターゲット列: ${targetColumn}

最適なメトリクスの選択と、モデリング設定についてアドバイスをお願いします。`;
  },

  /**
   * モデル精度の解釈支援
   */
  helpInterpretAccuracy(modelType: string, metrics: Record<string, number>): string {
    const metricsStr = Object.entries(metrics)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return `${modelType}モデルの精度結果を解釈してください。
メトリクス: ${metricsStr}

この精度はビジネス適用に十分か、改善の余地があるかアドバイスをお願いします。`;
  },

  /**
   * デプロイメントの支援
   */
  helpDeployment(modelType: string, deploymentOption: string): string {
    return `${modelType}モデルを${deploymentOption}オプションでデプロイする際の注意点を教えてください。
本番運用に向けて考慮すべき点（監視、再学習、スケーリングなど）についてもアドバイスをお願いします。`;
  },
};
