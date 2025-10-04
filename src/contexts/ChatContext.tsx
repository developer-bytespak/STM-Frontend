'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'provider' | 'lsm';
  content: string;
  timestamp: Date;
  type: 'text' | 'form-data' | 'file';
  formData?: BookingFormData;
  files?: {
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
}

export interface BookingFormData {
  serviceType: string;
  description: string;
  dimensions?: string;
  budget: string;
  preferredDate?: string;
  urgency?: string;
  additionalDetails?: string;
}

export interface ChatConversation {
  id: string;
  providerId: string;
  providerName: string;
  customerId: string;
  customerName: string;
  lsmId?: string;
  lsmName?: string;
  messages: Message[];
  isOpen: boolean;
  isMinimized: boolean;
  createdAt: Date;
}

interface ChatContextType {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  createConversation: (providerId: string, providerName: string, formData: BookingFormData) => void;
  openConversation: (conversationId: string) => void;
  closeConversation: () => void;
  minimizeConversation: () => void;
  maximizeConversation: () => void;
  sendMessage: (content: string, files?: File[]) => void;
  addLSMToChat: (lsmId: string, lsmName: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('chatConversations');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      const withDates = parsed.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setConversations(withDates);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('chatConversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const createConversation = (providerId: string, providerName: string, formData: BookingFormData) => {
    const conversationId = `conv-${Date.now()}`;
    const customerId = 'customer-1'; // This would come from auth context
    const customerName = 'John Doe'; // This would come from auth context

    // Create initial message with form data
    const initialMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: customerId,
      senderName: customerName,
      senderRole: 'customer',
      content: formatFormDataMessage(formData),
      timestamp: new Date(),
      type: 'form-data',
      formData: formData
    };

    const newConversation: ChatConversation = {
      id: conversationId,
      providerId,
      providerName,
      customerId,
      customerName,
      messages: [initialMessage],
      isOpen: true,
      isMinimized: false,
      createdAt: new Date()
    };

    setConversations(prev => [...prev, newConversation]);
    setActiveConversation(newConversation);

    // Simulate provider reading the message after 2 seconds
    setTimeout(() => {
      const autoReply: Message = {
        id: `msg-${Date.now()}`,
        senderId: providerId,
        senderName: providerName,
        senderRole: 'provider',
        content: `Hi! Thanks for reaching out. I've received your request for ${formData.serviceType}. Let me review the details and I'll get back to you shortly with a quote.`,
        timestamp: new Date(),
        type: 'text'
      };

      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, messages: [...conv.messages, autoReply] }
          : conv
      ));

      // Update active conversation if this is the active one
      setActiveConversation(prev => {
        if (prev && prev.id === conversationId) {
          return {
            ...prev,
            messages: [...prev.messages, autoReply]
          };
        }
        return prev;
      });
    }, 2000);
  };

  const formatFormDataMessage = (formData: BookingFormData): string => {
    let message = `**Service Request Details**\n\n`;
    message += `Service Type: ${formData.serviceType}\n`;
    message += `Description: ${formData.description}\n`;
    
    if (formData.dimensions) {
      message += `Dimensions/Size: ${formData.dimensions}\n`;
    }
    
    message += `Budget: $${formData.budget}\n`;
    
    if (formData.preferredDate) {
      message += `Preferred Date: ${formData.preferredDate}\n`;
    }
    
    if (formData.urgency) {
      message += `Urgency: ${formData.urgency}\n`;
    }
    
    if (formData.additionalDetails) {
      message += `Additional Details: ${formData.additionalDetails}`;
    }

    return message;
  };

  const openConversation = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setActiveConversation(conversation);
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, isOpen: true, isMinimized: false } : conv
      ));
    }
  };

  const closeConversation = () => {
    if (activeConversation) {
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id ? { ...conv, isOpen: false } : conv
      ));
    }
    setActiveConversation(null);
  };

  const minimizeConversation = () => {
    if (activeConversation) {
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id ? { ...conv, isMinimized: true } : conv
      ));
      setActiveConversation(prev => prev ? { ...prev, isMinimized: true } : null);
    }
  };

  const maximizeConversation = () => {
    if (activeConversation) {
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id ? { ...conv, isMinimized: false } : conv
      ));
      setActiveConversation(prev => prev ? { ...prev, isMinimized: false } : null);
    }
  };

  const sendMessage = (content: string, files?: File[]) => {
    if (!activeConversation) return;
    if (!content.trim() && (!files || files.length === 0)) return;

    const customerId = 'customer-1'; // From auth context
    const customerName = 'John Doe'; // From auth context

    // Handle file uploads
    if (files && files.length > 0) {
      const fileData = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file) // In production, upload to server first
      }));

      const fileMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: customerId,
        senderName: customerName,
        senderRole: 'customer',
        content: content.trim() || 'Sent file(s)',
        timestamp: new Date(),
        type: 'file',
        files: fileData
      };

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id 
          ? { ...conv, messages: [...conv.messages, fileMessage] }
          : conv
      ));

      // Update active conversation
      setActiveConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, fileMessage]
      } : null);
    } else {
      // Text message
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: customerId,
        senderName: customerName,
        senderRole: 'customer',
        content: content.trim(),
        timestamp: new Date(),
        type: 'text'
      };

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id 
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      ));

      // Update active conversation
      setActiveConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage]
      } : null);
    }
  };

  const addLSMToChat = (lsmId: string, lsmName: string) => {
    if (!activeConversation) return;

    const systemMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      senderRole: 'lsm',
      content: `${lsmName} was added`,
      timestamp: new Date(),
      type: 'text'
    };

    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation.id 
        ? { 
            ...conv, 
            lsmId, 
            lsmName,
            messages: [...conv.messages, systemMessage] 
          }
        : conv
    ));

    // Update active conversation
    setActiveConversation(prev => prev ? {
      ...prev,
      lsmId,
      lsmName,
      messages: [...prev.messages, systemMessage]
    } : null);
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      createConversation,
      openConversation,
      closeConversation,
      minimizeConversation,
      maximizeConversation,
      sendMessage,
      addLSMToChat
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

