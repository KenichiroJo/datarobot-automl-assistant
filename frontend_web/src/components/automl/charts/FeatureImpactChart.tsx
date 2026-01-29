/**
 * 特徴量重要度チャート（Plotly.js使用）
 * モデルの各特徴量の重要度を水平バーチャートで表示
 */
import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

interface FeatureImpact {
  featureName: string;
  impact: number;
  impactNormalized?: number;
}

interface FeatureImpactChartProps {
  data: FeatureImpact[];
  width?: number;
  height?: number;
  topN?: number;
  showPercentage?: boolean;
  className?: string;
}

export const FeatureImpactChart: React.FC<FeatureImpactChartProps> = ({
  data,
  width = 600,
  height = 400,
  topN = 10,
  showPercentage = true,
  className = '',
}) => {
  // 上位N件を取得してソート
  const sortedData = useMemo(() => {
    const sorted = [...data]
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, topN);
    // Plotlyは下から上に描画するので逆順
    return sorted.reverse();
  }, [data, topN]);

  // 最大値で正規化
  const maxImpact = Math.max(...sortedData.map(d => Math.abs(d.impact)));
  const normalizedImpacts = sortedData.map(d => 
    showPercentage ? (d.impactNormalized ?? (Math.abs(d.impact) / maxImpact) * 100) : Math.abs(d.impact)
  );

  // カラースケール（正/負で色分け）
  const colors = sortedData.map(d => 
    d.impact >= 0 ? '#2E7D32' : '#D32F2F'
  );

  const trace = {
    x: normalizedImpacts,
    y: sortedData.map(d => d.featureName),
    type: 'bar' as const,
    orientation: 'h' as const,
    marker: {
      color: colors,
      line: {
        width: 1,
        color: 'rgba(0,0,0,0.1)',
      },
    },
    text: normalizedImpacts.map(v => 
      showPercentage ? `${v.toFixed(1)}%` : v.toFixed(4)
    ),
    textposition: 'outside' as const,
    hovertemplate: '%{y}<br>Impact: %{x:.4f}<extra></extra>',
  };

  return (
    <div className={className}>
      <Plot
        data={[trace as Plotly.Data]}
        layout={{
          width,
          height,
          title: {
            text: 'Feature Impact',
            font: {
              size: 16,
              color: '#333',
            },
          },
          xaxis: {
            title: {
              text: showPercentage ? 'Normalized Impact (%)' : 'Impact',
              font: { size: 12 },
            },
            range: [0, Math.max(...normalizedImpacts) * 1.15],
            gridcolor: '#E0E0E0',
            zeroline: true,
            zerolinecolor: '#888',
          },
          yaxis: {
            automargin: true,
            tickfont: {
              size: 11,
            },
          },
          margin: {
            l: 150,
            r: 50,
            t: 60,
            b: 50,
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: '#FAFAFA',
          bargap: 0.3,
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

export default FeatureImpactChart;
