'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';

export default function ChatPopup() {
  const { 
    activeConversation, 
    closeConversation, 
    minimizeConversation,
    maximizeConversation,
    sendMessage, 
    addLSMToChat 
  } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [showLSMModal, setShowLSMModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  if (!activeConversation) return null;

  const isMinimized = activeConversation.isMinimized;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() || selectedFiles.length > 0) {
      sendMessage(messageInput, selectedFiles);
      setMessageInput('');
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleAddLSM = () => {
    // Mock LSM data - in real app, this would come from a selection modal
    addLSMToChat('lsm-1', 'Sarah Johnson');
    setShowLSMModal(false);
  };

  const formatMessageContent = (content: string) => {
    // Convert markdown-style formatting to HTML
    return content.split('\n').map((line, idx) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-bold text-white mb-3 text-base border-b border-white/30 pb-2">{line.slice(2, -2)}</p>;
      } else if (line.trim()) {
        // Split by colon to format as label: value
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const label = line.substring(0, colonIndex);
          const value = line.substring(colonIndex + 1).trim();
          return (
            <p key={idx} className="text-white mb-2 text-sm leading-relaxed">
              <span className="font-semibold">{label}:</span> {value}
            </p>
          );
        }
        return <p key={idx} className="text-white mb-1 text-sm">{line}</p>;
      }
      return null;
    });
  };

  // Minimized State
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={maximizeConversation}
          className="bg-navy-600 text-white px-6 py-3 rounded-lg shadow-2xl hover:bg-navy-700 transition-colors flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-white text-navy-600 rounded-full flex items-center justify-center font-bold text-sm">
            {activeConversation.providerName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">{activeConversation.providerName}</p>
            <p className="text-xs text-navy-200">Click to open chat</p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Chat Popup - Full Size */}
      <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
        {/* Header */}
        <div className="bg-navy-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-navy-600 rounded-full flex items-center justify-center font-bold text-sm">
              {activeConversation.providerName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{activeConversation.providerName}</h3>
              <p className="text-xs text-navy-200">Provider</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!activeConversation.lsmId && (
              <button
                onClick={() => setShowLSMModal(true)}
                className="text-white hover:bg-navy-700 p-2 rounded transition-colors"
                title="Add LSM to chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
            <button
              onClick={minimizeConversation}
              className="text-white hover:bg-navy-700 p-2 rounded transition-colors"
              title="Minimize"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={closeConversation}
              className="text-white hover:bg-navy-700 p-2 rounded transition-colors"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* LSM Badge */}
        {activeConversation.lsmId && (
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
            <p className="text-xs text-blue-700">
              🛡️ <span className="font-semibold">{activeConversation.lsmName}</span> (LSM) is in this conversation
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {activeConversation.messages.map((message) => {
            const isCustomer = message.senderRole === 'customer';
            const isSystem = message.senderId === 'system';

            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center my-2">
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-md text-xs">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={message.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isCustomer ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {!isCustomer && (
                      <span className="text-xs font-semibold text-gray-600">{message.senderName}</span>
                    )}
                    {message.senderRole === 'lsm' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">LSM</span>
                    )}
                  </div>
                  <div 
                    className={`rounded-lg px-4 py-3 ${
                      isCustomer
                        ? 'text-white rounded-br-none'
                        : message.type === 'form-data'
                        ? 'rounded-bl-none'
                        : 'bg-white border border-gray-200 rounded-bl-none'
                    }`}
                    style={isCustomer || message.type === 'form-data'
                      ? { backgroundColor: '#00a63e' } 
                      : undefined
                    }
                  >
                    {message.type === 'form-data' ? (
                      <div>
                        {formatMessageContent(message.content)}
                      </div>
                    ) : message.type === 'file' && message.files ? (
                      <div>
                        {message.content !== 'Sent file(s)' && (
                          <p className="text-sm mb-2">{message.content}</p>
                        )}
                        <div className="space-y-2">
                          {message.files.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.url}
                              download={file.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 p-2 rounded hover:opacity-80 transition-opacity ${
                                isCustomer ? '' : 'bg-gray-100'
                              }`}
                              style={isCustomer ? { backgroundColor: '#008c35' } : undefined}
                            >
                              <svg className={`w-5 h-5 ${isCustomer ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <div className="flex-1 text-xs">
                                <p className={`font-medium truncate ${isCustomer ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                                <p className={isCustomer ? 'text-white opacity-80' : 'text-gray-600'}>{formatFileSize(file.size)}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
            <div className="text-xs text-gray-600 mb-2">Attachments:</div>
            <div className="space-y-1">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-navy-600 p-2 rounded hover:bg-gray-100 transition-colors"
              title="Attach files"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
            <button
              type="submit"
              disabled={!messageInput.trim() && selectedFiles.length === 0}
              className="bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Add LSM Modal */}
      {showLSMModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Local Service Manager</h3>
            <p className="text-gray-600 mb-6">
              Would you like to add a Local Service Manager (LSM) to this conversation? 
              LSMs can help mediate and ensure quality service delivery.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleAddLSM}
                className="flex-1 bg-navy-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-navy-700 transition-colors"
              >
                Add LSM
              </button>
              <button
                onClick={() => setShowLSMModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
