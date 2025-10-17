'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import ChatPopup from '@/components/chat/ChatPopup';

export default function LSMChatsPage() {
  const { conversations, openConversation, activeConversation } = useChat();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'all' | 'active'>('all');

  // Filter conversations
  const filteredConversations = selectedTab === 'active' 
    ? conversations.filter(conv => conv.messages.length > 0 || conv.isOpen)
    : conversations;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Dispute Chats</h1>
          <p className="text-blue-100">
            Manage conversations for disputes in your region
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('all')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${selectedTab === 'all'
                    ? 'border-navy-600 text-navy-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                All Chats ({conversations.length})
              </button>
              <button
                onClick={() => setSelectedTab('active')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${selectedTab === 'active'
                    ? 'border-navy-600 text-navy-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Active ({filteredConversations.filter(c => c.messages.length > 0).length})
              </button>
            </nav>
          </div>
        </div>

        {/* Chat List */}
        {filteredConversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No chats yet
            </h3>
            <p className="text-gray-500">
              When you join dispute chats, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredConversations.map((conversation) => {
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              const hasUnread = false; // You can implement unread logic later

              return (
                <div
                  key={conversation.id}
                  onClick={() => openConversation(conversation.id)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-navy-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Chat Participants */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {conversation.customerName} ⟷ {conversation.providerName}
                          </h3>
                          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                            LSM
                          </span>
                          {hasUnread && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>

                        {/* Job Info */}
                        {conversation.jobId && (
                          <p className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">Job #{conversation.jobId}</span>
                          </p>
                        )}

                        {/* Last Message */}
                        {lastMessage ? (
                          <div className="flex items-start gap-2">
                            <p className="text-sm text-gray-600 flex-1">
                              <span className="font-medium">{lastMessage.senderName}:</span>{' '}
                              {lastMessage.content.substring(0, 100)}
                              {lastMessage.content.length > 100 && '...'}
                            </p>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {new Date(lastMessage.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No messages yet
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openConversation(conversation.id);
                        }}
                        className="ml-4 bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700 transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Open Chat
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat Popup */}
      {activeConversation && <ChatPopup />}
    </div>
  );
}

