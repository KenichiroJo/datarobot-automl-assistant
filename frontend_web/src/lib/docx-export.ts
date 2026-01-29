/**
 * Word(.docx)形式でのエクスポート機能
 * docxライブラリを使用してテーマ定義シートとプロジェクトレポートを出力
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
} from 'docx';
import { saveAs } from 'file-saver';
import type { ThemeDefinition, ModelInfo, DatasetInfo } from '@/types/automl';

// スタイル定義
const STYLES = {
  heading1: {
    bold: true,
    size: 32,
    color: '2E7D32', // Green
  },
  heading2: {
    bold: true,
    size: 26,
    color: '1976D2', // Blue
  },
  heading3: {
    bold: true,
    size: 22,
  },
  normal: {
    size: 22,
  },
  label: {
    bold: true,
    size: 22,
    color: '666666',
  },
};

// テーブルセルを作成
function createTableCell(text: string, isHeader = false, width?: number): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: isHeader,
            size: isHeader ? 22 : 20,
          }),
        ],
      }),
    ],
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: isHeader ? { fill: 'E8F5E9' } : undefined,
  });
}

// ラベルと値のペアを作成
function createLabelValueParagraphs(label: string, value: string | undefined): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: `■ ${label}`,
          ...STYLES.label,
        }),
      ],
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: value || '（未設定）',
          ...STYLES.normal,
        }),
      ],
      spacing: { after: 200 },
    }),
  ];
}

// セクションヘッダーを作成
function createSectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        ...STYLES.heading2,
      }),
    ],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
    border: {
      bottom: {
        color: '1976D2',
        space: 1,
        size: 6,
        style: BorderStyle.SINGLE,
      },
    },
  });
}

/**
 * テーマ定義シートをWord形式で生成
 */
export async function generateThemeDefinitionDocx(theme: ThemeDefinition): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'AI プロジェクト テーマ定義シート',
                    size: 18,
                    color: '888888',
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 18,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                  }),
                  new TextRun({
                    text: ' / ',
                    size: 18,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          // タイトル
          new Paragraph({
            children: [
              new TextRun({
                text: 'AI プロジェクト テーマ定義シート',
                ...STYLES.heading1,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 400 },
            alignment: AlignmentType.CENTER,
          }),

          // プロジェクト情報テーブル
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell('プロジェクト名', true, 30),
                  createTableCell(theme.title || '（未設定）', false, 70),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('業界', true, 30),
                  createTableCell(theme.industry?.name || '（未設定）', false, 70),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('ユースケース', true, 30),
                  createTableCell(theme.useCase?.name || '（未設定）', false, 70),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('問題タイプ', true, 30),
                  createTableCell(
                    theme.targetType === 'binary' ? '二値分類' :
                    theme.targetType === 'regression' ? '回帰' : '多クラス分類',
                    false, 70
                  ),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('作成日', true, 30),
                  createTableCell(new Date(theme.createdAt).toLocaleDateString('ja-JP'), false, 70),
                ],
              }),
            ],
          }),

          // 課題の明確化
          createSectionHeader('課題の明確化'),
          ...createLabelValueParagraphs('解決したい課題とアクション', theme.problemStatement),
          ...createLabelValueParagraphs('現在の業務フロー', theme.currentWorkflow),

          // データ準備とモデリング
          createSectionHeader('データ準備とモデリング'),
          ...createLabelValueParagraphs('予測対象（ターゲット）', theme.targetVariable || theme.targetColumn),
          ...createLabelValueParagraphs('使用するデータセット', theme.datasetDescription),
          ...createLabelValueParagraphs('データソースと特徴量', theme.dataSourcesAndFeatures),
          ...createLabelValueParagraphs('予測の対象グループとサンプル数', theme.targetGroupAndSampleSize),
          ...createLabelValueParagraphs('モデルがビジネス適用される条件', theme.businessApplicationConditions),

          // ビジネス適用
          createSectionHeader('ビジネス適用'),
          ...createLabelValueParagraphs('業務における実運用フロー', theme.operationalWorkflow),
          ...createLabelValueParagraphs('予測のタイプ', theme.predictionType),
          ...createLabelValueParagraphs('システム連携', theme.systemIntegration),
          ...createLabelValueParagraphs('計算可能なインパクト', theme.calculableImpact),
          ...createLabelValueParagraphs('計算不可能なインパクト', theme.nonCalculableImpact),

          // 担当者
          createSectionHeader('担当者'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell('役割', true, 40),
                  createTableCell('担当者', true, 60),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('プロジェクトオーナー', false, 40),
                  createTableCell(theme.projectOwner || '（未設定）', false, 60),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('業務オーナー', false, 40),
                  createTableCell(theme.businessOwner || '（未設定）', false, 60),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('データ準備担当', false, 40),
                  createTableCell(theme.dataPreparationOwner || '（未設定）', false, 60),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('モデリング担当', false, 40),
                  createTableCell(theme.modelingOwner || '（未設定）', false, 60),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('意思決定者', false, 40),
                  createTableCell(theme.decisionMaker || '（未設定）', false, 60),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('システム実装担当', false, 40),
                  createTableCell(theme.systemImplementer || '（未設定）', false, 60),
                ],
              }),
            ],
          }),

          // スケジュール
          createSectionHeader('スケジュール'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell('マイルストーン', true, 50),
                  createTableCell('期限', true, 50),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('データ準備完了', false, 50),
                  createTableCell(theme.dataPreparationDeadline || '（未設定）', false, 50),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('モデリング完了', false, 50),
                  createTableCell(theme.modelingDeadline || '（未設定）', false, 50),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('ビジネス適用', false, 50),
                  createTableCell(theme.businessApplicationDate || '（未設定）', false, 50),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `テーマ定義シート_${theme.title || 'untitled'}_${new Date().toISOString().slice(0, 10)}.docx`;
  saveAs(blob, filename);
}

/**
 * プロジェクト完了レポートをWord形式で生成
 */
export async function generateProjectReportDocx(
  theme: ThemeDefinition,
  datasetInfo: DatasetInfo | null,
  bestModel: ModelInfo | null,
  deploymentId: string | null
): Promise<void> {
  const children: (Paragraph | Table)[] = [
    // タイトル
    new Paragraph({
      children: [
        new TextRun({
          text: 'AI プロジェクト 完了レポート',
          ...STYLES.heading1,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `レポート生成日: ${new Date().toLocaleDateString('ja-JP')} ${new Date().toLocaleTimeString('ja-JP')}`,
          size: 20,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    // プロジェクト概要
    createSectionHeader('プロジェクト概要'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createTableCell('プロジェクト名', true, 30),
            createTableCell(theme.title || '（未設定）', false, 70),
          ],
        }),
        new TableRow({
          children: [
            createTableCell('業界', true, 30),
            createTableCell(theme.industry?.name || '（未設定）', false, 70),
          ],
        }),
        new TableRow({
          children: [
            createTableCell('ユースケース', true, 30),
            createTableCell(theme.useCase?.name || '（未設定）', false, 70),
          ],
        }),
        new TableRow({
          children: [
            createTableCell('問題タイプ', true, 30),
            createTableCell(
              theme.targetType === 'binary' ? '二値分類' :
              theme.targetType === 'regression' ? '回帰' : '多クラス分類',
              false, 70
            ),
          ],
        }),
      ],
    }),
  ];

  // データセット情報
  if (datasetInfo) {
    children.push(
      createSectionHeader('データセット情報'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createTableCell('データセット名', true, 30),
              createTableCell(datasetInfo.name, false, 70),
            ],
          }),
          new TableRow({
            children: [
              createTableCell('行数', true, 30),
              createTableCell(datasetInfo.rows.toLocaleString(), false, 70),
            ],
          }),
          new TableRow({
            children: [
              createTableCell('カラム数', true, 30),
              createTableCell(String(datasetInfo.columns), false, 70),
            ],
          }),
          new TableRow({
            children: [
              createTableCell('ターゲット列', true, 30),
              createTableCell(datasetInfo.targetColumn || theme.targetColumn || '（未設定）', false, 70),
            ],
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: '■ 特徴量一覧',
            ...STYLES.label,
          }),
        ],
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: datasetInfo.features.join(', '),
            ...STYLES.normal,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // ベストモデル情報
  if (bestModel) {
    const metricsRows: TableRow[] = [
      new TableRow({
        children: [
          createTableCell('メトリクス', true, 50),
          createTableCell('値', true, 50),
        ],
      }),
    ];

    if (bestModel.metrics.auc !== undefined) {
      metricsRows.push(new TableRow({
        children: [
          createTableCell('AUC', false, 50),
          createTableCell(bestModel.metrics.auc.toFixed(4), false, 50),
        ],
      }));
    }
    if (bestModel.metrics.accuracy !== undefined) {
      metricsRows.push(new TableRow({
        children: [
          createTableCell('正確度', false, 50),
          createTableCell(bestModel.metrics.accuracy.toFixed(4), false, 50),
        ],
      }));
    }
    if (bestModel.metrics.f1 !== undefined) {
      metricsRows.push(new TableRow({
        children: [
          createTableCell('F1スコア', false, 50),
          createTableCell(bestModel.metrics.f1.toFixed(4), false, 50),
        ],
      }));
    }
    if (bestModel.metrics.rmse !== undefined) {
      metricsRows.push(new TableRow({
        children: [
          createTableCell('RMSE', false, 50),
          createTableCell(bestModel.metrics.rmse.toFixed(4), false, 50),
        ],
      }));
    }
    if (bestModel.metrics.r2 !== undefined) {
      metricsRows.push(new TableRow({
        children: [
          createTableCell('R²', false, 50),
          createTableCell(bestModel.metrics.r2.toFixed(4), false, 50),
        ],
      }));
    }

    children.push(
      createSectionHeader('ベストモデル'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createTableCell('モデルタイプ', true, 30),
              createTableCell(bestModel.modelType, false, 70),
            ],
          }),
          new TableRow({
            children: [
              createTableCell('モデルID', true, 30),
              createTableCell(bestModel.modelId, false, 70),
            ],
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: '■ 評価メトリクス',
            ...STYLES.label,
          }),
        ],
        spacing: { before: 200, after: 100 },
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: metricsRows,
      })
    );
  }

  // デプロイメント情報
  if (deploymentId) {
    children.push(
      createSectionHeader('デプロイメント情報'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createTableCell('デプロイメントID', true, 30),
              createTableCell(deploymentId, false, 70),
            ],
          }),
          new TableRow({
            children: [
              createTableCell('ステータス', true, 30),
              createTableCell('アクティブ', false, 70),
            ],
          }),
          new TableRow({
            children: [
              createTableCell('DataRobot URL', true, 30),
              createTableCell(`https://app.datarobot.com/deployments/${deploymentId}`, false, 70),
            ],
          }),
        ],
      })
    );
  }

  // ビジネスインパクト
  children.push(
    createSectionHeader('ビジネスインパクト'),
    ...createLabelValueParagraphs('計算可能なインパクト', theme.calculableImpact),
    ...createLabelValueParagraphs('計算不可能なインパクト', theme.nonCalculableImpact),
    new Paragraph({
      children: [
        new TextRun({
          text: 'このレポートはAutoML Assistantによって自動生成されました',
          size: 18,
          color: '888888',
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `プロジェクトレポート_${theme.title || 'untitled'}_${new Date().toISOString().slice(0, 10)}.docx`;
  saveAs(blob, filename);
}
