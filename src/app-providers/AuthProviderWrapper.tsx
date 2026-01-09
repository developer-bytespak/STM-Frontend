'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { ChatProvider } from '@/contexts/ChatContext';
import { CallProvider } from '@/contexts/CallContext';
import ChatPopup from '@/components/chat/ChatPopup';
import VoiceCallModal from '@/components/call/VoiceCallModal';
import { ReactNode } from 'react';

export default function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CallProvider>
        <ChatProvider>
          {children}
          <ChatPopup />
          <VoiceCallModal />
        </ChatProvider>
      </CallProvider>
    </AuthProvider>
  );
}

