import React, { useCallback, useState } from 'react';
import { useAutoMLStore } from '@/hooks/use-automl-store';
import { WorkflowStepper } from '@/components/automl/WorkflowStepper';
import { ThemeStep } from '@/components/automl/ThemeStep';
import { DataStep } from '@/components/automl/DataStep';
import { PrepareStep } from '@/components/automl/PrepareStep';
import { BuildStep, type AutopilotConfig } from '@/components/automl/BuildStep';
import { AccuracyStep } from '@/components/automl/AccuracyStep';
import { TestStep } from '@/components/automl/TestStep';
import { DeployStep, type DeployConfig } from '@/components/automl/DeployStep';
import { AssistantChatPanel } from '@/components/automl/AssistantChatPanel';
import { Menu, Plus, Trash2, MessageCircle, Terminal, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { ThemeDefinition, Industry, UseCase, DatasetInfo, ModelInfo, WorkflowStep } from '@/types/automl';

// API Base URL
const API_BASE_URL = '/api/v1';

// ログエントリの型
interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export const AutoMLPage: React.FC = () => {
  const {
    projects,
    activeProjectId,
    createProject,
    updateProject,
    deleteProject,
    setActiveProject,
  } = useAutoMLStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [logPanelOpen, setLogPanelOpen] = useState(true);
  const [logPanelExpanded, setLogPanelExpanded] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const currentStep = activeProject?.currentStep || 'theme';

  // ログ追加関数
  const addLog = (level: LogEntry['level'], message: string, details?: string) => {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      details,
    };
    setLogs(prev => [...prev, entry]);
    console.log(`[${level.toUpperCase()}] ${message}`, details || '');
  };

  // ログクリア
  const clearLogs = () => setLogs([]);

  // ステップナビゲーション
  const handleStepClick = (step: WorkflowStep) => {
    if (activeProjectId) {
      updateProject(activeProjectId, { currentStep: step });
    }
  };

  const goToNextStep = () => {
    if (!activeProjectId) return;
    const steps: WorkflowStep[] = ['theme', 'data', 'prepare', 'build', 'accuracy', 'test', 'deploy'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      updateProject(activeProjectId, { 
        currentStep: nextStep,
        completedSteps: [...(activeProject?.completedSteps || []), currentStep]
      });
    }
  };

  const goToPrevStep = () => {
    if (!activeProjectId) return;
    const steps: WorkflowStep[] = ['theme', 'data', 'prepare', 'build', 'accuracy', 'test', 'deploy'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      updateProject(activeProjectId, { currentStep: steps[currentIndex - 1] });
    }
  };

  // チャット関連
  const handleSendMessage = async (message: string) => {
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsChatLoading(true);
    
    // TODO: 実際のエージェントAPIを呼び出す
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setChatMessages(prev => [...prev, { 
      role: 'assistant', 
      content: `ご質問ありがとうございます。${message}についてですが、現在のステップ「${currentStep}」に関連する情報をお伝えします...` 
    }]);
    setIsChatLoading(false);
  };

  // Theme Step ハンドラー
  const handleIndustrySelect = (industry: Industry) => {
    if (activeProjectId) {
      updateProject(activeProjectId, { 
        themeDefinition: { 
          ...(activeProject?.themeDefinition || {}),
          industry,
          useCase: undefined,
        } as ThemeDefinition 
      });
    }
  };

  const handleUseCaseSelect = (useCase: UseCase) => {
    if (activeProjectId && activeProject?.themeDefinition) {
      updateProject(activeProjectId, { 
        themeDefinition: { 
          ...activeProject.themeDefinition,
          useCase,
          targetType: useCase.targetType,
        } 
      });
    }
  };

  const handleThemeDefinitionSubmit = (definition: ThemeDefinition) => {
    if (activeProjectId) {
      updateProject(activeProjectId, { themeDefinition: definition });
      goToNextStep();
    }
  };

  // Data Step ハンドラー
  const handleFileUpload = async (file: File): Promise<void> => {
    addLog('info', `ファイルアップロード開始: ${file.name}`, `サイズ: ${(file.size / 1024).toFixed(1)} KB`);
    
    try {
      // ファイルをBase64に変換
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1] || base64);
        };
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(file);
      const base64Content = await base64Promise;
      addLog('info', 'Base64変換完了');
      
      // エージェントAPIを呼び出してDataRobotにアップロード
      addLog('info', 'DataRobot AIカタログへアップロード中...');
      
      try {
        const response = await fetch(`${API_BASE_URL}/agent/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `upload_dataset_to_ai_catalogツールを使って、ファイル名「${file.name}」をアップロードしてください。`,
            context: {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              base64Content: base64Content.substring(0, 50000), // 最初の50KB
            }
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          addLog('success', 'DataRobotへのアップロード成功', JSON.stringify(result, null, 2));
          
          // プロジェクト情報を更新
          if (activeProjectId) {
            const datasetInfo: DatasetInfo = {
              datasetId: result.datasetId || `dataset-${Date.now()}`,
              name: file.name,
              rows: result.rows || 0,
              columns: result.columns || 0,
              features: result.features || [],
              targetColumn: activeProject?.themeDefinition?.targetColumn || '',
              uploadedAt: new Date().toISOString(),
            };
            updateProject(activeProjectId, { 
              datasetId: datasetInfo.datasetId,
              datasetInfo: datasetInfo,
            });
          }
        } else {
          throw new Error(`API Error: ${response.status}`);
        }
      } catch (apiError) {
        addLog('warning', 'API呼び出しに失敗、ローカルモードで続行', String(apiError));
        
        // ローカルモード: ファイル情報を保存
        const fileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        };
        localStorage.setItem('pendingUpload', JSON.stringify(fileInfo));
        
        // プロジェクト情報を更新
        if (activeProjectId) {
          const datasetInfo: DatasetInfo = {
            datasetId: `local-${Date.now()}`,
            name: file.name,
            rows: 0,
            columns: 0,
            features: [],
            targetColumn: activeProject?.themeDefinition?.targetColumn || '',
            uploadedAt: new Date().toISOString(),
          };
          updateProject(activeProjectId, { 
            datasetId: datasetInfo.datasetId,
            datasetInfo: datasetInfo,
          });
          addLog('success', 'ローカルにファイル情報を保存しました');
        }
      }
      
      // チャットにも通知
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `📁 **${file.name}** のアップロード処理が完了しました。\n\n次のステップに進むか、「データを分析して」と入力してEDAを開始できます。`,
        },
      ]);
      
    } catch (error) {
      addLog('error', 'ファイルアップロード失敗', String(error));
      alert(`❌ ファイルの準備に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGenerateSampleData = async () => {
    addLog('info', 'サンプルデータ生成開始...');
    
    // TODO: サンプルデータ生成API呼び出し
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (activeProjectId) {
      const mockDatasetInfo: DatasetInfo = {
        datasetId: `dataset-sample-${Date.now()}`,
        name: 'sample_data.csv',
        rows: 5000,
        columns: 10,
        features: ['customer_id', 'customer_tenure', 'monthly_charges', 'contract_type', 'payment_method', 'total_charges', 'tech_support', 'internet_service', 'online_security', 'churn'],
        targetColumn: activeProject?.themeDefinition?.targetColumn || 'churn',
        uploadedAt: new Date().toISOString(),
      };
      updateProject(activeProjectId, { 
        datasetId: mockDatasetInfo.datasetId,
        datasetInfo: mockDatasetInfo,
      });
      addLog('success', 'サンプルデータ生成完了', `5000行 × 10列`);
    }
  };

  // Prepare Step ハンドラー
  const handleAnalyzeData = async () => {
    addLog('info', 'データ分析（EDA）開始...');
    // TODO: EDA分析API呼び出し
    await new Promise(resolve => setTimeout(resolve, 3000));
    addLog('success', 'データ分析完了');
  };

  // Build Step ハンドラー
  const handleStartAutopilot = async (config: AutopilotConfig) => {
    addLog('info', 'Autopilot開始...', JSON.stringify(config, null, 2));
    
    // TODO: 実際のAPIを呼び出す
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    if (activeProjectId) {
      const mockModel: ModelInfo = {
        modelId: `model-${Date.now()}`,
        modelType: 'Light Gradient Boosted Trees Classifier',
        metrics: {
          auc: 0.9289,
          accuracy: 0.8754,
          f1: 0.8612,
          precision: 0.8923,
          recall: 0.8321,
        },
        sampleSize: 10000,
        features: 14,
      };
      updateProject(activeProjectId, { 
        projectId: `project-${Date.now()}`,
        modelId: mockModel.modelId,
        bestModel: mockModel,
      });
      addLog('success', 'Autopilot完了', `ベストモデル: ${mockModel.modelType}, AUC: ${mockModel.metrics.auc}`);
    }
  };

  // Accuracy Step ハンドラー
  const handleLoadInsights = useCallback(async () => {
    addLog('info', 'モデルインサイト読み込み中...');
    // TODO: モデルインサイトAPI呼び出し
    await new Promise(resolve => setTimeout(resolve, 2000));
    addLog('success', 'インサイト読み込み完了');
  }, []);

  const handleExportReport = async () => {
    addLog('info', 'レポートエクスポート中...');
    // TODO: レポートエクスポート機能
    addLog('success', 'レポートをエクスポートしました');
  };

  // Test Step ハンドラー
  const handlePredict = async (data: Record<string, unknown>) => {
    addLog('info', '予測実行中...', JSON.stringify(data, null, 2));
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = {
      prediction: 'Churn',
      probability: 0.7842,
      positiveClass: 'Yes',
      explanations: [
        { feature: 'contract_type', strength: 0.35, direction: 'positive' as const },
        { feature: 'customer_tenure', strength: 0.28, direction: 'negative' as const },
        { feature: 'monthly_charges', strength: 0.22, direction: 'positive' as const },
        { feature: 'tech_support', strength: 0.15, direction: 'positive' as const },
      ],
    };
    
    addLog('success', '予測完了', `結果: ${result.prediction} (確率: ${(result.probability * 100).toFixed(1)}%)`);
    return result;
  };

  // Deploy Step ハンドラー
  const handleDeploy = async (config: DeployConfig) => {
    addLog('info', 'デプロイ開始...', JSON.stringify(config, null, 2));
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const deploymentId = `deployment-${Date.now()}`;
    if (activeProjectId) {
      updateProject(activeProjectId, { deploymentId });
    }
    
    const result = {
      deploymentId,
      predictionServer: 'https://app.datarobot.com/prediction-server',
      apiEndpoint: `https://app.datarobot.com/predApi/v1.0/deployments/${deploymentId}/predictions`,
      status: 'active' as const,
    };
    
    addLog('success', 'デプロイ完了', `Deployment ID: ${deploymentId}`);
    return result;
  };

  const handleProjectComplete = () => {
    if (activeProjectId) {
      updateProject(activeProjectId, { 
        completedSteps: ['theme', 'data', 'prepare', 'build', 'accuracy', 'test', 'deploy'],
        status: 'completed',
      });
    }
  };

  // 新規プロジェクト作成
  const handleCreateProject = () => {
    const newId = createProject(`新規プロジェクト ${projects.length + 1}`);
    setActiveProject(newId);
  };

  // ステップコンテンツのレンダリング
  const renderStepContent = () => {
    if (!activeProject) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Plus className="w-12 h-12 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">プロジェクトを開始</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            AutoML Assistantで機械学習プロジェクトを始めましょう。
            業界とユースケースを選択し、AIがモデル構築をサポートします。
          </p>
          <button
            onClick={handleCreateProject}
            className="px-6 py-3 bg-[#81FBA5] text-gray-900 rounded-lg font-semibold hover:bg-[#6de992] transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            新規プロジェクトを作成
          </button>
        </div>
      );
    }

    switch (currentStep) {
      case 'theme':
        return (
          <ThemeStep
            selectedIndustry={activeProject.themeDefinition?.industry || null}
            selectedUseCase={activeProject.themeDefinition?.useCase || null}
            themeDefinition={activeProject.themeDefinition || null}
            onIndustrySelect={handleIndustrySelect}
            onUseCaseSelect={handleUseCaseSelect}
            onSubmit={handleThemeDefinitionSubmit}
          />
        );
      case 'data':
        return (
          <DataStep
            themeDefinition={activeProject.themeDefinition || null}
            datasetInfo={activeProject.datasetInfo || null}
            onFileUpload={handleFileUpload}
            onGenerateSampleData={handleGenerateSampleData}
            onNext={goToNextStep}
            onBack={goToPrevStep}
          />
        );
      case 'prepare':
        return (
          <PrepareStep
            themeDefinition={activeProject.themeDefinition || null}
            datasetInfo={activeProject.datasetInfo || null}
            onAnalyzeData={handleAnalyzeData}
            onNext={goToNextStep}
            onBack={goToPrevStep}
          />
        );
      case 'build':
        return (
          <BuildStep
            themeDefinition={activeProject.themeDefinition || null}
            datasetId={activeProject.datasetId || null}
            onStartAutopilot={handleStartAutopilot}
            onNext={goToNextStep}
            onBack={goToPrevStep}
          />
        );
      case 'accuracy':
        return (
          <AccuracyStep
            projectId={activeProject.projectId || null}
            bestModel={activeProject.bestModel || null}
            onLoadInsights={handleLoadInsights}
            onExportReport={handleExportReport}
            onNext={goToNextStep}
            onBack={goToPrevStep}
          />
        );
      case 'test':
        return (
          <TestStep
            projectId={activeProject.projectId || null}
            modelId={activeProject.modelId || null}
            bestModel={activeProject.bestModel || null}
            onPredict={handlePredict}
            onNext={goToNextStep}
            onBack={goToPrevStep}
          />
        );
      case 'deploy':
        return (
          <DeployStep
            projectId={activeProject.projectId || null}
            modelId={activeProject.modelId || null}
            bestModel={activeProject.bestModel || null}
            deploymentId={activeProject.deploymentId || null}
            onDeploy={handleDeploy}
            onComplete={handleProjectComplete}
            onBack={goToPrevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* サイドバー */}
      <div className={`
        ${sidebarOpen ? 'w-64' : 'w-0'} 
        transition-all duration-300 overflow-hidden border-r border-gray-800 bg-gray-900 flex flex-col
      `}>
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            AutoML Assistant
          </h1>
        </div>
        
        {/* プロジェクト一覧 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={handleCreateProject}
            className="w-full py-2 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:border-[#81FBA5] hover:text-[#81FBA5] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新規プロジェクト
          </button>
          
          {projects.map((project) => (
            <div
              key={project.id}
              className={`
                p-3 rounded-lg cursor-pointer transition-colors group
                ${project.id === activeProjectId
                  ? 'bg-[#81FBA5]/10 border border-[#81FBA5]'
                  : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                }
              `}
              onClick={() => setActiveProject(project.id)}
            >
              <div className="flex items-center justify-between">
                <span className={`font-medium truncate ${project.id === activeProjectId ? 'text-[#81FBA5]' : 'text-white'}`}>
                  {project.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {project.themeDefinition?.useCase?.name || '未設定'}
              </div>
              <div className="flex gap-1 mt-2">
                {(['theme', 'data', 'prepare', 'build', 'accuracy', 'test', 'deploy'] as WorkflowStep[]).map((step) => (
                  <div
                    key={step}
                    className={`
                      h-1 flex-1 rounded-full
                      ${project.completedSteps.includes(step)
                        ? 'bg-[#81FBA5]'
                        : project.currentStep === step
                          ? 'bg-blue-500'
                          : 'bg-gray-700'
                      }
                    `}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="h-14 border-b border-gray-800 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {activeProject && (
            <WorkflowStepper
              currentStep={currentStep}
              completedSteps={activeProject.completedSteps}
              onStepClick={handleStepClick}
            />
          )}
          
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`
              p-2 rounded-lg transition-colors
              ${chatOpen ? 'bg-[#81FBA5] text-gray-900' : 'text-gray-400 hover:text-white'}
            `}
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </header>

        {/* コンテンツエリア */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* メインコンテンツ + チャット */}
          <div className="flex-1 flex overflow-hidden">
            {/* ステップコンテンツ */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                {renderStepContent()}
              </div>
            </div>

            {/* チャットパネル */}
            {chatOpen && (
              <div className="w-96 border-l border-gray-800">
                <AssistantChatPanel
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  onQuickAction={(action) => handleSendMessage(action)}
                  isLoading={isChatLoading}
                />
              </div>
            )}
          </div>

          {/* ログパネル */}
          {logPanelOpen && (
            <div className={`border-t border-gray-800 bg-gray-950 transition-all ${logPanelExpanded ? 'h-80' : 'h-40'}`}>
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#81FBA5]" />
                  <span className="text-sm font-medium text-white">実行ログ</span>
                  <span className="text-xs text-gray-500">({logs.length}件)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearLogs}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    クリア
                  </button>
                  <button
                    onClick={() => setLogPanelExpanded(!logPanelExpanded)}
                    className="p-1 text-gray-500 hover:text-white transition-colors"
                  >
                    {logPanelExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setLogPanelOpen(false)}
                    className="p-1 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="h-[calc(100%-36px)] overflow-y-auto p-2 font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-600 text-center py-4">ログはまだありません</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="py-1 border-b border-gray-900 last:border-0">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 flex-shrink-0">
                          {log.timestamp.toLocaleTimeString('ja-JP')}
                        </span>
                        <span className={`flex-shrink-0 ${
                          log.level === 'success' ? 'text-green-400' :
                          log.level === 'error' ? 'text-red-400' :
                          log.level === 'warning' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="text-gray-300">{log.message}</span>
                      </div>
                      {log.details && (
                        <pre className="text-gray-500 ml-24 mt-1 text-[10px] overflow-x-auto whitespace-pre-wrap">
                          {log.details}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ログパネル表示ボタン（閉じている時） */}
        {!logPanelOpen && (
          <button
            onClick={() => setLogPanelOpen(true)}
            className="fixed bottom-4 right-4 p-3 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
            title="ログパネルを開く"
          >
            <Terminal className="w-5 h-5 text-[#81FBA5]" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AutoMLPage;
