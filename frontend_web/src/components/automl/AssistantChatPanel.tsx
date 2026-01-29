import React, { useState } from 'react';
import { useChatContext } from '@/hooks/use-chat-context';
import { MessageSquare, Send } from 'lucide-react';

interface AssistantChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  title?: string;
  placeholder?: string;
}

export const AssistantChatPanel: React.FC<AssistantChatPanelProps> = ({
  isOpen,
  onToggle,
  title = 'アシスタント',
  placeholder = '質問を入力...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const {
    sendMessage,
    combinedEvents,
    isAgentRunning,
  } = useChatContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isAgentRunning) return;
    
    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#81FBA5] text-gray-900 rounded-full shadow-lg flex items-center justify-center hover:bg-[#6de992] transition-colors z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="w-96 h-full bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#81FBA5] rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-gray-900" />
          </div>
          <span className="font-semibold text-white">{title}</span>
        </div>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          チャットを隠す
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {combinedEvents.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>AIアシスタントに質問してください</p>
          </div>
        ) : (
          combinedEvents.map((event, index) => {
            if (event.type === 'message' && event.value) {
              const message = event.value;
              const isUser = message.role === 'user';
              const content = typeof message.content === 'string' 
                ? message.content 
                : message.content?.parts?.map((p: { text?: string }) => p.text).join('') || '';

              return (
                <div
                  key={message.id || index}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isUser
                        ? 'bg-[#81FBA5] text-gray-900'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{content}</p>
                  </div>
                </div>
              );
            }
            return null;
          })
        )}
        
        {isAgentRunning && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                <span className="text-sm">考え中...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-gray-700">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickAction('課題を明確にしたい')}
            className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
          >
            課題を明確にしたい
          </button>
          <button
            onClick={() => handleQuickAction('テーマ例を見せて')}
            className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
          >
            テーマ例を見せて
          </button>
          <button
            onClick={() => handleQuickAction('予測対象とは？')}
            className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
          >
            予測対象とは？
          </button>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={isAgentRunning}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#81FBA5] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isAgentRunning}
            className="px-4 py-2 bg-[#81FBA5] text-gray-900 rounded-lg hover:bg-[#6de992] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
