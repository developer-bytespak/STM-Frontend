'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface CallContextType {
  // Call state
  isCallModalOpen: boolean;
  providerName: string;
  providerId?: string;
  
  // Call actions
  openCall: (providerName: string, providerId?: string) => void;
  closeCall: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [providerName, setProviderName] = useState('');
  const [providerId, setProviderId] = useState<string | undefined>();

  const openCall = useCallback((name: string, id?: string) => {
    setProviderName(name);
    setProviderId(id);
    setIsCallModalOpen(true);
  }, []);

  const closeCall = useCallback(() => {
    setIsCallModalOpen(false);
  }, []);

  return (
    <CallContext.Provider
      value={{
        isCallModalOpen,
        providerName,
        providerId,
        openCall,
        closeCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}
