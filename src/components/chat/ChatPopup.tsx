'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { customerApi } from '@/api/customer';

export default function ChatPopup() {
  const { 
    activeConversation, 
    closeConversation, 
    minimizeConversation,
    minimizeToCompact,
    maximizeConversation,
    sendMessage, 
    addLSMToChat,
    isPreviewMinimized,
    isSocketConnected,
    connectionError
  } = useChat();
  const { user } = useAuth();
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

  const handleAddLSM = async () => {
    if (!activeConversation?.jobId) {
      alert('Cannot file dispute: No job ID associated with this conversation');
      setShowLSMModal(false);
      return;
    }

    try {
      // File dispute through the API
      const result = await customerApi.fileDispute({
        jobId: activeConversation.jobId
      });

      // Add LSM to chat UI
      addLSMToChat('lsm-1', 'Local Service Manager');
      
      alert(result.message || 'Dispute filed successfully. LSM has been notified and will join the conversation.');
      setShowLSMModal(false);
    } catch (error: any) {
      console.error('Failed to file dispute:', error);
      alert(error.message || 'Failed to file dispute. Please try again.');
      setShowLSMModal(false);
    }
  };

  const handleViewFile = (file: {name: string, url: string, type: string}) => {
    window.open(file.url, '_blank');
  };

  const handleDownloadFile = (file: {name: string, url: string, type: string}) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatMessageContent = (content: string) => {
    // Convert markdown-style formatting to HTML
    return content.split('\n').map((line, idx) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        return <p key={idx} className="font-bold text-white mb-3 text-sm border-b border-white/30 pb-2 break-words overflow-wrap-anywhere hyphens-auto">{trimmedLine.slice(2, -2)}</p>;
      } else if (trimmedLine) {
        // Split by colon to format as label: value
        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex > 0) {
          const label = trimmedLine.substring(0, colonIndex).trim();
          const value = trimmedLine.substring(colonIndex + 1).trim();
          return (
            <div key={idx} className="text-white mb-2 text-sm leading-relaxed break-words overflow-wrap-anywhere hyphens-auto">
              <span className="font-semibold">{label}:</span> {value}
            </div>
          );
        }
        return <p key={idx} className="text-white mb-1 text-sm break-words overflow-wrap-anywhere hyphens-auto">{trimmedLine}</p>;
      }
      return null;
    });
  };

  // Preview Minimized State - Button style like the attached image
  if (isPreviewMinimized) {
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

  // Compact Minimized State - Still functional chat but smaller
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-80 h-[400px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
        {/* Header */}
        <div className="bg-navy-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-navy-600 rounded-full flex items-center justify-center font-bold text-xs">
              {activeConversation.providerName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <button
                onClick={() => {
                  // Extract service information from the first form-data message
                  const formDataMessage = activeConversation.messages.find(msg => msg.type === 'form-data');
                  const serviceType = formDataMessage?.formData?.serviceType || 'General Service';
                  const category = 'Interior Cleaning'; // Default category - could be made dynamic
                  const location = '75001 - Dallas, TX'; // Default location - could be made dynamic
                  
                  // Construct the full provider URL with parameters
                  const params = new URLSearchParams({
                    service: serviceType,
                    category: category,
                    location: location
                  });
                  
                  window.open(`/providers/${activeConversation.providerId}?${params.toString()}`, '_blank');
                }}
                className="font-semibold text-sm hover:text-navy-200 transition-colors cursor-pointer text-left"
                title="View business profile"
              >
                {activeConversation.providerName}
              </button>
              <p className="text-xs text-navy-200">Provider</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
        <button
          onClick={maximizeConversation}
              className="text-white hover:bg-navy-700 p-2 rounded transition-colors"
              title="Maximize to full chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              onClick={closeConversation}
              className="text-white hover:bg-navy-700 p-2 rounded transition-colors"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* LSM Badge */}
        {activeConversation.lsmId && (
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
            <p className="text-xs text-blue-700">
              🛡 <span className="font-semibold">{activeConversation.lsmName}</span> (LSM) is in this conversation
            </p>
          </div>
        )}

        {/* Connection Status Indicator - Compact */}
        {!isSocketConnected && (
          <div className="bg-red-50 px-3 py-1.5 border-b border-red-100">
            <p className="text-xs text-red-700 flex items-center gap-1">
              <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Reconnecting...</span>
            </p>
          </div>
        )}

        {/* Messages - Compact */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
          {activeConversation.messages.map((message) => {
            const isOwnMessage = user && Number(message.senderId) === Number(user.id);
            const isSystem = message.senderId === 'system';

            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center my-1">
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1 rounded-md text-xs">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`${isOwnMessage ? 'order-2 max-w-[85%]' : message.type === 'form-data' ? 'order-1 max-w-[95%]' : 'order-1 max-w-[85%]'}`}>
                  <div className="flex items-center gap-1 mb-1">
                    {!isOwnMessage && (
                      <span className="text-xs font-semibold text-gray-600">{message.senderName}</span>
                    )}
                    {message.senderRole === 'local_service_manager' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded-full font-medium">LSM</span>
                    )}
                  </div>
                  <div 
                    className={`rounded-lg ${
                      isOwnMessage
                        ? 'text-white rounded-br-none px-3 py-2'
                        : message.type === 'form-data'
                        ? 'rounded-bl-none px-3 py-3'
                        : 'bg-white border border-gray-200 rounded-bl-none text-gray-900 px-3 py-2'
                    }`}
                    style={isOwnMessage || message.type === 'form-data'
                      ? { backgroundColor: '#00a63e' } 
                      : undefined
                    }
                  >
                    {message.type === 'form-data' ? (
                      <div className="text-gray-900 w-full">
                        {formatMessageContent(message.content)}
                      </div>
                    ) : message.type === 'file' && message.files ? (
                      <div>
                        {message.content !== 'Sent file(s)' && (
                          <p className="text-xs mb-1 text-gray-900">{message.content}</p>
                        )}
                        <div className="space-y-1">
                          {message.files.map((file, idx) => (
                            <div key={idx} className="space-y-1">
                              <div
                                className={`flex items-center gap-1 p-1 rounded hover:opacity-80 transition-opacity ${
                                  isOwnMessage ? 'bg-white border border-gray-200' : 'bg-gray-100'
                                }`}
                              >
                                <svg className={`w-4 h-4 ${isOwnMessage ? 'text-gray-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div className="flex-1 text-xs">
                                  <p className={`font-medium truncate ${isOwnMessage ? 'text-gray-800' : 'text-gray-900'}`}>{file.name}</p>
                                  <p className={isOwnMessage ? 'text-gray-500' : 'text-gray-600'}>{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleViewFile(file)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors flex items-center gap-1"
                                  title="View file"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View
                                </button>
                                <button
                                  onClick={() => handleDownloadFile(file)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors flex items-center gap-1"
                                  title="Download file"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Download
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className={`text-xs whitespace-pre-wrap break-words overflow-wrap-anywhere ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>{message.content}</p>
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

        {/* Selected Files Preview - Compact */}
        {selectedFiles.length > 0 && (
          <div className="border-t border-gray-200 px-3 py-2 bg-gray-50">
            <div className="text-xs text-gray-600 mb-1">Attachments:</div>
            <div className="space-y-1">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-1 rounded border border-gray-200">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
          </div>
        )}

        {/* Input - Compact */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
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
              className="text-gray-500 hover:text-navy-600 p-1 rounded hover:bg-gray-100 transition-colors"
              title="Attach files"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
            />
            <button
              type="submit"
              disabled={!messageInput.trim() && selectedFiles.length === 0}
              className="bg-navy-600 text-white px-3 py-2 rounded-lg hover:bg-navy-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
        </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      {/* Chat Popup - Full Size */}
      <div className="fixed bottom-4 right-4 w-[420px] h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
        {/* Header */}
        <div className="bg-navy-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-navy-600 rounded-full flex items-center justify-center font-bold text-sm">
              {activeConversation.providerName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <button
                onClick={() => {
                  // Extract service information from the first form-data message
                  const formDataMessage = activeConversation.messages.find(msg => msg.type === 'form-data');
                  const serviceType = formDataMessage?.formData?.serviceType || 'General Service';
                  const category = 'Interior Cleaning'; // Default category - could be made dynamic
                  const location = '75001 - Dallas, TX'; // Default location - could be made dynamic
                  
                  // Construct the full provider URL with parameters
                  const params = new URLSearchParams({
                    service: serviceType,
                    category: category,
                    location: location
                  });
                  
                  window.open(`/providers/${activeConversation.providerId}?${params.toString()}`, '_blank');
                }}
                className="font-semibold text-sm hover:text-navy-200 transition-colors cursor-pointer text-left"
                title="View business profile"
              >
                {activeConversation.providerName}
              </button>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.29 3.86L1.82 18A1 1 0 002.68 19.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01" />
                </svg>
              </button>
            )}
            <button
              onClick={minimizeConversation}
              className="text-white hover:bg-navy-700 p-2 rounded transition-colors"
              title="Minimize chat (original)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={minimizeToCompact}
              className="text-white hover:bg-navy-700 p-2 rounded transition-colors"
              title="Minimize to compact chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
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
              🛡 <span className="font-semibold">{activeConversation.lsmName}</span> (LSM) is in this conversation
            </p>
          </div>
        )}

        {/* Connection Status Indicator */}
        {!isSocketConnected && (
          <div className="bg-red-50 px-4 py-2 border-b border-red-100">
            <p className="text-xs text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">
                {connectionError || 'Connection lost. Reconnecting...'}
              </span>
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-gray-50">
          {activeConversation.messages.map((message) => {
            const isOwnMessage = user && Number(message.senderId) === Number(user.id);
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
              <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`${isOwnMessage ? 'order-2 max-w-[80%]' : message.type === 'form-data' ? 'order-1 w-full' : 'order-1 max-w-[80%]'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {!isOwnMessage && (
                      <span className="text-xs font-semibold text-gray-600">{message.senderName}</span>
                    )}
                    {message.senderRole === 'local_service_manager' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">LSM</span>
                    )}
                  </div>
                  <div 
                    className={`rounded-lg ${
                      isOwnMessage
                        ? 'text-white rounded-br-none px-4 py-3'
                        : message.type === 'form-data'
                        ? 'rounded-bl-none px-3 py-4'
                        : 'bg-white border border-gray-200 rounded-bl-none text-gray-900 px-4 py-3'
                    }`}
                    style={isOwnMessage || message.type === 'form-data'
                      ? { backgroundColor: '#00a63e' } 
                      : undefined
                    }
                  >
                    {message.type === 'form-data' ? (
                      <div className="text-gray-900 w-full">
                        {formatMessageContent(message.content)}
                      </div>
                    ) : message.type === 'file' && message.files ? (
                      <div>
                        {message.content !== 'Sent file(s)' && (
                          <p className="text-sm mb-2 text-gray-900">{message.content}</p>
                        )}
                        <div className="space-y-2">
                          {message.files.map((file, idx) => (
                            <div key={idx} className="space-y-2">
                              <div
                                className={`flex items-center gap-2 p-2 rounded hover:opacity-80 transition-opacity ${
                                  isOwnMessage ? 'bg-white border border-gray-200' : 'bg-gray-100'
                                }`}
                              >
                                <svg className={`w-5 h-5 ${isOwnMessage ? 'text-gray-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div className="flex-1 text-xs">
                                  <p className={`font-medium truncate ${isOwnMessage ? 'text-gray-800' : 'text-gray-900'}`}>{file.name}</p>
                                  <p className={isOwnMessage ? 'text-gray-500' : 'text-gray-600'}>{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleViewFile(file)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                                  title="View file"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View
                                </button>
                                <button
                                  onClick={() => handleDownloadFile(file)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                                  title="Download file"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Download
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className={`text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>{message.content}</p>
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Raise Dispute</h3>
            <p className="text-gray-600 mb-6">
              Would you like to raise a dispute for this conversation? 
              We recommend to add an LSM to help mediate and ensure quality service delivery.
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