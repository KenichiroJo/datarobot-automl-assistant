// AutoML Assistant ストア（Zustand）
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type {
  WorkflowStep,
  ThemeDefinition,
  ModelInfo,
  DatasetInfo,
} from '@/types/automl';

// プロジェクト状態（シンプル化版）
export interface ProjectState {
  id: string;
  name: string;
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  status: 'draft' | 'in_progress' | 'completed';
  
  // テーマ定義
  themeDefinition: ThemeDefinition | null;
  
  // DataRobot関連のID
  datasetId: string | null;
  projectId: string | null;
  modelId: string | null;
  deploymentId: string | null;
  
  // モデル情報
  bestModel: ModelInfo | null;
  
  // データ情報
  datasetInfo: DatasetInfo | null;
  
  createdAt: string;
  updatedAt: string;
}

interface AutoMLStore {
  // プロジェクト一覧
  projects: ProjectState[];
  
  // アクティブなプロジェクトID
  activeProjectId: string | null;
  
  // アクション
  createProject: (name: string) => string;
  updateProject: (id: string, updates: Partial<ProjectState>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
}

export const useAutoMLStore = create<AutoMLStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,

      createProject: (name: string) => {
        const newProject: ProjectState = {
          id: uuid(),
          name,
          currentStep: 'theme',
          completedSteps: [],
          status: 'draft',
          themeDefinition: null,
          datasetId: null,
          projectId: null,
          modelId: null,
          deploymentId: null,
          bestModel: null,
          datasetInfo: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id,
        }));
        
        return newProject.id;
      },

      updateProject: (id: string, updates: Partial<ProjectState>) => {
        set(state => ({
          projects: state.projects.map(p =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      deleteProject: (id: string) => {
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          activeProjectId:
            state.activeProjectId === id ? null : state.activeProjectId,
        }));
      },

      setActiveProject: (id: string | null) => {
        set({ activeProjectId: id });
      },
    }),
    {
      name: 'automl-assistant-storage',
      partialize: state => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);
