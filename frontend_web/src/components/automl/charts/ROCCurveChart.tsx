/**
 * ROC曲線チャート（Plotly.js使用）
 * モデルの二値分類性能を可視化
 */
import React from 'react';
import Plot from 'react-plotly.js';
import type { ROCCurveData } from '@/types/automl';

interface ROCCurveChartProps {
  data: ROCCurveData;
  width?: number;
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export const ROCCurveChart: React.FC<ROCCurveChartProps> = ({
  data,
  width = 500,
  height = 400,
  showLegend = true,
  className = '',
}) => {
  // ROC曲線のメイントレース
  const rocTrace = {
    x: data.fpr,
    y: data.tpr,
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: `ROC Curve (AUC = ${data.auc.toFixed(3)})`,
    line: {
      color: '#2E7D32',
      width: 3,
    },
    fill: 'tozeroy',
    fillcolor: 'rgba(46, 125, 50, 0.1)',
    hovertemplate: 'FPR: %{x:.3f}<br>TPR: %{y:.3f}<extra></extra>',
  };

  // ランダム予測のベースライン（対角線）
  const baselineTrace = {
    x: [0, 1],
    y: [0, 1],
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: 'Random Classifier',
    line: {
      color: '#888888',
      width: 2,
      dash: 'dash' as const,
    },
    hoverinfo: 'skip' as const,
  };

  // 最適閾値のポイント（オプション）
  const optimalPoint = data.thresholds ? {
    x: [data.fpr[Math.floor(data.fpr.length / 2)]],
    y: [data.tpr[Math.floor(data.tpr.length / 2)]],
    type: 'scatter' as const,
    mode: 'markers' as const,
    name: 'Optimal Point',
    marker: {
      color: '#1976D2',
      size: 12,
      symbol: 'circle',
    },
  } : null;

  const traces = optimalPoint 
    ? [rocTrace, baselineTrace, optimalPoint]
    : [rocTrace, baselineTrace];

  return (
    <div className={className}>
      <Plot
        data={traces as Plotly.Data[]}
        layout={{
          width,
          height,
          title: {
            text: 'ROC Curve',
            font: {
              size: 16,
              color: '#333',
            },
          },
          xaxis: {
            title: {
              text: 'False Positive Rate (1 - Specificity)',
              font: { size: 12 },
            },
            range: [0, 1],
            dtick: 0.2,
            gridcolor: '#E0E0E0',
            zeroline: false,
          },
          yaxis: {
            title: {
              text: 'True Positive Rate (Sensitivity)',
              font: { size: 12 },
            },
            range: [0, 1],
            dtick: 0.2,
            gridcolor: '#E0E0E0',
            zeroline: false,
          },
          showlegend: showLegend,
          legend: {
            x: 0.5,
            y: -0.2,
            xanchor: 'center',
            orientation: 'h',
          },
          margin: {
            l: 60,
            r: 30,
            t: 60,
            b: showLegend ? 80 : 50,
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: '#FAFAFA',
          hovermode: 'closest',
          annotations: [
            {
              x: 0.7,
              y: 0.2,
              text: `AUC = ${data.auc.toFixed(4)}`,
              showarrow: false,
              font: {
                size: 18,
                color: '#2E7D32',
              },
              bgcolor: 'rgba(255,255,255,0.8)',
              borderpad: 4,
            },
          ],
        }}
        config={{
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          responsive: true,
        }}
      />
    </div>
  );
};

export default ROCCurveChart;
