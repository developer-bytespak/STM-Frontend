import React, { useState, useEffect } from 'react';
import SalesAssistantChat from './SalesAssistantChat';
import { useAuth } from '@/hooks/useAuth';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Only show AI Assistant for customers
  const isCustomer = isAuthenticated && user?.role === 'customer';

  // Auto-open chat if returning from provider profile
  useEffect(() => {
    if (!isCustomer) return; // Don't auto-open for non-customers
    
    const isAiChatActive = sessionStorage.getItem('ai_chat_active');
    if (isAiChatActive === 'true') {
      setIsOpen(true);
      // Clear the flag after opening
      sessionStorage.removeItem('ai_chat_active');
    }
  }, [isCustomer]);

  // Don't render anything if user is not a customer
  if (!isCustomer) {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
        <button
          aria-label="Open SPS AI chat"
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 shadow-2xl flex items-center justify-center p-1 rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <img src="/chatbot.png" alt="AI" className="w-10 h-10 object-contain" />
        </button>
        <div className="text-xs text-white font-semibold bg-gray-900 bg-opacity-70 px-2 py-1 rounded-full backdrop-blur-sm">AI Assistant</div>
      </div>

      {/* AI Chat Modal */}
      <SalesAssistantChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatWidget;

