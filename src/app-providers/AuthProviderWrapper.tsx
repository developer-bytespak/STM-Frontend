'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatPopup from '@/components/chat/ChatPopup';
import { ReactNode } from 'react';

export default function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ChatProvider>
        {children}
        <ChatPopup />
      </ChatProvider>
    </AuthProvider>
  );
}

