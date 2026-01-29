/**
 * 混同行列チャート（Plotly.js使用）
 * 分類モデルの予測結果を可視化
 */
import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

interface ConfusionMatrixData {
  matrix: number[][];
  labels: string[];
}

interface ConfusionMatrixChartProps {
  data: ConfusionMatrixData;
  width?: number;
  height?: number;
  showPercentage?: boolean;
  className?: string;
}

export const ConfusionMatrixChart: React.FC<ConfusionMatrixChartProps> = ({
  data,
  width = 400,
  height = 400,
  showPercentage = false,
  className = '',
}) => {
  // パーセンテージ計算
  const { displayMatrix, annotations } = useMemo(() => {
    const total = data.matrix.flat().reduce((a, b) => a + b, 0);
    const display = showPercentage
      ? data.matrix.map(row => row.map(val => (val / total) * 100))
      : data.matrix;

    // アノテーション（セル内の数値）
    const annots: Plotly.Annotations[] = [];
    for (let i = 0; i < data.matrix.length; i++) {
      for (let j = 0; j < data.matrix[i].length; j++) {
        const value = data.matrix[i][j];
        const displayVal = showPercentage
          ? `${((value / total) * 100).toFixed(1)}%`
          : value.toString();
        annots.push({
          x: j,
          y: i,
          text: displayVal,
          showarrow: false,
          font: {
            size: 16,
            color: value > total / (data.matrix.length * 2) ? 'white' : 'black',
          },
        });
      }
    }

    return { displayMatrix: display, annotations: annots };
  }, [data, showPercentage]);

  const heatmapTrace = {
    z: displayMatrix,
    x: data.labels,
    y: data.labels,
    type: 'heatmap' as const,
    colorscale: [
      [0, '#E8F5E9'],
      [0.5, '#66BB6A'],
      [1, '#1B5E20'],
    ],
    showscale: true,
    hovertemplate:
      'Predicted: %{x}<br>Actual: %{y}<br>Count: %{z}<extra></extra>',
  };

  return (
    <div className={className}>
      <Plot
        data={[heatmapTrace as Plotly.Data]}
        layout={{
          width,
          height,
          title: {
            text: 'Confusion Matrix',
            font: {
              size: 16,
              color: '#333',
            },
          },
          xaxis: {
            title: {
              text: 'Predicted',
              font: { size: 12 },
            },
            side: 'bottom',
          },
          yaxis: {
            title: {
              text: 'Actual',
              font: { size: 12 },
            },
            autorange: 'reversed',
          },
          annotations,
          margin: {
            l: 80,
            r: 80,
            t: 60,
            b: 60,
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
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

export default ConfusionMatrixChart;
