import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

interface FileUploadWidgetProps {
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  isUploading: boolean;
  uploadedFileName: string | null;
  acceptedTypes?: string;
}

export const FileUploadWidget: React.FC<FileUploadWidgetProps> = ({
  onFileSelect,
  onUpload,
  isUploading,
  uploadedFileName,
  acceptedTypes = '.csv,.xlsx,.xls',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  if (uploadedFileName) {
    return (
      <div className="bg-gray-800 border border-[#81FBA5] rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#81FBA5]/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-[#81FBA5]" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">アップロード完了</p>
            <p className="text-gray-400 text-sm">{uploadedFileName}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${dragActive
            ? 'border-[#81FBA5] bg-[#81FBA5]/10'
            : 'border-gray-600 hover:border-gray-500 bg-gray-800'
          }
        `}
      >
        <input
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-white font-medium">
              ファイルをドラッグ＆ドロップ
            </p>
            <p className="text-gray-400 text-sm mt-1">
              または<span className="text-[#81FBA5]">クリックして選択</span>
            </p>
          </div>
          <p className="text-gray-500 text-xs">
            対応形式: CSV, Excel (.xlsx, .xls)
          </p>
        </div>
      </div>

      {selectedFile && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <button
            onClick={onUpload}
            disabled={isUploading}
            className={`
              w-full mt-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
              ${isUploading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-[#81FBA5] text-gray-900 hover:bg-[#6de992]'
              }
            `}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                アップロード中...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                DataRobotにアップロード
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
