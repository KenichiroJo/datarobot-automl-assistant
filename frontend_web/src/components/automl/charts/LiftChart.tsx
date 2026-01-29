/**
 * リフトチャート（Plotly.js使用）
 * モデルの予測性能をベースラインと比較
 */
import React from 'react';
import Plot from 'react-plotly.js';
import type { LiftChartData } from '@/types/automl';

interface LiftChartProps {
  data: LiftChartData;
  width?: number;
  height?: number;
  showCumulative?: boolean;
  className?: string;
}

export const LiftChart: React.FC<LiftChartProps> = ({
  data,
  width = 500,
  height = 400,
  showCumulative = true,
  className = '',
}) => {
  // 累積リフトのトレース
  const liftTrace = {
    x: data.bins,
    y: data.lift,
    type: 'scatter' as const,
    mode: 'lines+markers' as const,
    name: 'Lift',
    line: {
      color: '#1976D2',
      width: 2,
    },
    marker: {
      color: '#1976D2',
      size: 8,
    },
    hovertemplate: 'Percentile: %{x}<br>Lift: %{y:.2f}<extra></extra>',
  };

  // 累積データのトレース（オプション）
  const cumulativeTrace = showCumulative && data.actual ? {
    x: data.bins,
    y: data.actual,
    type: 'bar' as const,
    name: 'Actual Rate',
    marker: {
      color: 'rgba(46, 125, 50, 0.6)',
      line: {
        width: 1,
        color: '#2E7D32',
      },
    },
    yaxis: 'y2',
    hovertemplate: 'Percentile: %{x}<br>Actual: %{y:.1%}<extra></extra>',
  } : null;

  // ベースライン（リフト=1）
  const baselineTrace = {
    x: [data.bins[0], data.bins[data.bins.length - 1]],
    y: [1, 1],
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: 'Baseline (Lift = 1)',
    line: {
      color: '#888888',
      width: 2,
      dash: 'dash' as const,
    },
    hoverinfo: 'skip' as const,
  };

  const traces = cumulativeTrace
    ? [cumulativeTrace, liftTrace, baselineTrace]
    : [liftTrace, baselineTrace];

  return (
    <div className={className}>
      <Plot
        data={traces as Plotly.Data[]}
        layout={{
          width,
          height,
          title: {
            text: 'Lift Chart',
            font: {
              size: 16,
              color: '#333',
            },
          },
          xaxis: {
            title: {
              text: 'Percentile',
              font: { size: 12 },
            },
            range: [0, 100],
            dtick: 10,
            gridcolor: '#E0E0E0',
          },
          yaxis: {
            title: {
              text: 'Lift',
              font: { size: 12 },
            },
            range: [0, Math.max(...data.lift) * 1.1],
            gridcolor: '#E0E0E0',
            zeroline: false,
          },
          yaxis2: showCumulative && data.actual ? {
            title: {
              text: 'Actual Rate',
              font: { size: 12 },
            },
            overlaying: 'y',
            side: 'right',
            showgrid: false,
            range: [0, Math.max(...(data.actual || [1])) * 1.2],
            tickformat: '.0%',
          } : undefined,
          showlegend: true,
          legend: {
            x: 0.5,
            y: -0.2,
            xanchor: 'center',
            orientation: 'h',
          },
          margin: {
            l: 60,
            r: showCumulative ? 60 : 30,
            t: 60,
            b: 80,
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: '#FAFAFA',
          hovermode: 'closest',
          barmode: 'overlay',
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

export default LiftChart;
