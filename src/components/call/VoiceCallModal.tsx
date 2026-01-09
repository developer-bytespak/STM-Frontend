'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Device } from '@twilio/voice-sdk';
import { generateVoiceToken } from '@/api/call';
import { session } from '@/api/session';
import { useCall } from '@/contexts/CallContext';
import { X, Phone, PhoneOff, Mic, MicOff, LogIn } from 'lucide-react';

interface VoiceCallModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  providerName?: string;
  providerId?: string;
  onRestore?: () => void;
}

type CallStatus = 'idle' | 'connecting' | 'ringing' | 'connected' | 'disconnected' | 'busy' | 'rejected' | 'no-answer' | 'failed' | 'error';

export default function VoiceCallModal(props: VoiceCallModalProps = {}) {
  // Use CallContext if available, otherwise use props
  const callContext = useCall();
  
  const isOpen = props.isOpen !== undefined ? props.isOpen : callContext.isCallModalOpen;
  const onClose = props.onClose || (() => callContext.closeCall());
  const providerName = props.providerName || callContext.providerName;
  const providerId = props.providerId || callContext.providerId;
  const onRestore = props.onRestore;
  
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [callDuration, setCallDuration] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isDeviceReady, setIsDeviceReady] = useState(false);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);
  const [callHasEnded, setCallHasEnded] = useState(false);
  
  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check authentication when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    const token = session.getAccessToken();
    const authenticated = !!token;
    setIsAuthenticated(authenticated);
    
    if (!authenticated) {
      console.log('⚠️ User is not authenticated');
      setError(null);
      setStatusMessage('');
      setCallStatus('idle');
    }
  }, [isOpen]);

  // Initialize Twilio Device
  useEffect(() => {
    // Don't reinitialize if previous call already ended
    if (!isOpen || !isAuthenticated || callHasEnded) {
      // Cleanup when modal closes or user logs out
      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
      }
      setIsDeviceReady(false);
      return;
    }

    const initializeDevice = async () => {
      try {
        setIsInitializing(true);
        setStatusMessage('Initializing...');
        console.log('🔑 Fetching voice token...');
        const { token } = await generateVoiceToken();
        
        // Token expires in 3600 seconds (1 hour)
        setTokenExpiresAt(Date.now() + (3600 * 1000));
        
        console.log('📞 Initializing Twilio Device...');
        const device = new Device(token, {
          logLevel: 1,
        });

        // Device event listeners
        device.on('registered', () => {
          console.log('✅ Twilio Device registered');
          setIsDeviceReady(true);
          setStatusMessage('Ready to call');
          setIsInitializing(false);
        });

        device.on('error', (error) => {
          console.error('❌ Twilio Device error:', error);
          setError(error.message);
          setStatusMessage('Device initialization failed');
          setCallStatus('error');
          setIsInitializing(false);
          setIsDeviceReady(false);
        });

        device.on('incoming', (call) => {
          console.log('📞 Incoming call:', call.parameters);
          // Handle incoming call if needed
        });

        await device.register();
        deviceRef.current = device;
        
        console.log('✅ Device registration initiated');
      } catch (err: any) {
        console.error('❌ Failed to initialize device:', err);
        
        // Check if it's an unauthorized error
        if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
          setError(null);
          setStatusMessage('Login required to make calls');
          setCallStatus('error');
          setIsAuthenticated(false);
        } else {
          setError(err.message || 'Failed to initialize calling');
          setStatusMessage('Device initialization failed');
          setCallStatus('error');
        }
        setIsInitializing(false);
        setIsDeviceReady(false);
      }
    };

    initializeDevice();

    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
      }
      setIsDeviceReady(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (tokenRefreshTimerRef.current) {
        clearTimeout(tokenRefreshTimerRef.current);
      }
    };
  }, [isOpen, isAuthenticated, callHasEnded]);

  // Token refresh effect - refresh token 5 minutes before expiry
  useEffect(() => {
    if (!tokenExpiresAt || !deviceRef.current || !isDeviceReady) return;
    
    const timeUntilExpiry = tokenExpiresAt - Date.now();
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000); // Refresh 5 min before expiry
    
    if (refreshTime <= 0) {
      // Token already expired or expiring soon, refresh immediately
      refreshToken();
    } else {
      tokenRefreshTimerRef.current = setTimeout(() => {
        refreshToken();
      }, refreshTime);
    }
    
    return () => {
      if (tokenRefreshTimerRef.current) {
        clearTimeout(tokenRefreshTimerRef.current);
      }
    };
  }, [tokenExpiresAt]);

  // Refresh voice token before expiry
  const refreshToken = async () => {
    try {
      console.log('🔄 Refreshing voice token...');
      const { token } = await generateVoiceToken();
      
      if (deviceRef.current && isDeviceReady) {
        await deviceRef.current.updateToken(token);
        setTokenExpiresAt(Date.now() + (3600 * 1000)); // New expiry: 1 hour from now
        console.log('✅ Voice token refreshed successfully');
      }
    } catch (err) {
      console.error('❌ Failed to refresh token:', err);
      setError('Session expired. Please login again.');
      setIsAuthenticated(false);
    }
  };

  // Helper to verify device is truly connected and ready
  const isDeviceConnected = (): boolean => {
    return (
      deviceRef.current !== null &&
      isDeviceReady &&
      deviceRef.current.state === 'registered'
    );
  };

  // Start call timer
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  // Stop call timer
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Make a call
  const makeCall = async () => {
    // Check authentication
    if (!isAuthenticated) {
      setError(null);
      setStatusMessage('Please login to make calls');
      setCallStatus('error');
      return;
    }

    if (!isDeviceConnected()) {
      setError('Device not ready. Please refresh.');
      setStatusMessage('Device initialization failed');
      setCallStatus('error');
      
      // Auto-retry device initialization after a delay
      setTimeout(() => {
        setCallStatus('idle');
        setIsInitializing(true);
      }, 2000);
      return;
    }

    if (callRef.current) {
      console.log('⚠️ Call already in progress');
      return;
    }

    try {
      console.log('📞 Making call...');
      setCallStatus('connecting');
      setStatusMessage('Connecting...');
      setError(null);
      
      const call = await deviceRef.current!.connect({
        params: {
          To: providerId || 'provider', // Can be used for routing on backend
        },
      });

      callRef.current = call;

      // Call event listeners
      call.on('accept', () => {
        console.log('✅ Call accepted');
        setCallStatus('connected');
        setStatusMessage('Call connected');
        startTimer();
      });

      call.on('disconnect', (connection: any) => {
        console.log('📴 Call disconnected', connection);
        setCallStatus('disconnected');
        setStatusMessage('Call ended');
        setCallHasEnded(true);
        stopTimer();

        // If minimized, auto-remove the minimized UI shortly after remote hangup
        if (isMinimized) {
          setTimeout(() => {
            setIsMinimized(false);
            setCallDuration(0);
            // Cleanup device
            if (deviceRef.current) {
              try {
                deviceRef.current.destroy();
              } catch (e) {
                // ignore
              }
              deviceRef.current = null;
            }
          }, 1500);
        } else {
          setTimeout(() => {
            onClose();
          }, 2500);
        }
      });

      call.on('cancel', () => {
        console.log('❌ Call cancelled');
        setCallStatus('disconnected');
        setStatusMessage('Call cancelled');
        setCallHasEnded(true);
        stopTimer();
        if (isMinimized) {
          setTimeout(() => {
            setIsMinimized(false);
            setCallDuration(0);
          }, 1500);
        } else {
          setTimeout(() => {
            onClose();
          }, 2500);
        }
      });

      call.on('reject', () => {
        console.log('❌ Call rejected');
        setCallStatus('rejected');
        setStatusMessage('Provider rejected the call');
        setCallHasEnded(true);
        stopTimer();
        if (isMinimized) {
          setTimeout(() => {
            setIsMinimized(false);
            setCallDuration(0);
          }, 1500);
        } else {
          setTimeout(() => {
            onClose();
          }, 3000);
        }
      });

      call.on('error', (error: any) => {
        console.error('❌ Call error:', error);
        setCallHasEnded(true);
        
        // Parse Twilio error codes
        let errorMessage = 'Call failed';
        if (error.code === 31486) {
          errorMessage = 'Provider is busy';
          setCallStatus('busy');
        } else if (error.code === 31480 || error.message?.includes('busy')) {
          errorMessage = 'Provider is busy';
          setCallStatus('busy');
        } else if (error.code === 31603 || error.message?.includes('timeout')) {
          errorMessage = 'No answer from provider';
          setCallStatus('no-answer');
        } else if (error.code === 31005) {
          errorMessage = 'Provider unavailable';
          setCallStatus('failed');
        } else {
          setCallStatus('error');
        }
        
        setError(errorMessage);
        setStatusMessage(errorMessage);
        stopTimer();
        if (isMinimized) {
          setTimeout(() => {
            setIsMinimized(false);
            setCallDuration(0);
          }, 1500);
        } else {
          setTimeout(() => {
            onClose();
          }, 3000);
        }
      });

      setCallStatus('ringing');
      setStatusMessage('Calling provider...');
    } catch (err: any) {
      console.error('❌ Failed to make call:', err);
      setError(err.message || 'Failed to make call');
      setCallStatus('error');
    }
  };

  // End call
  const endCall = () => {
    if (callRef.current) {
      callRef.current.disconnect();
      callRef.current = null;
    }
    stopTimer();
    setCallStatus('disconnected');
  };

  // Toggle mute
  const toggleMute = () => {
    if (callRef.current) {
      const newMuteState = !isMuted;
      callRef.current.mute(newMuteState);
      setIsMuted(newMuteState);
    }
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    onClose();
    router.push('/login');
  };
  const handleClose = () => {
    // If a call is active or connecting, minimize instead of ending the call
    if (callRef.current && (callStatus === 'connecting' || callStatus === 'ringing' || callStatus === 'connected')) {
      setIsMinimized(true);
      // Don't call onClose - just hide the modal UI while keeping the component alive for the minimized widget
      return;
    }

    // No active call -> perform normal close and reset
    if (callRef.current) {
      endCall();
    }
    setCallDuration(0);
    setCallStatus('idle');
    setCallHasEnded(false);
    setError(null);
    setStatusMessage('');
    setIsInitializing(false);
    onClose();
  };

  // clear forced open when parent closes/when ending modal
  useEffect(() => {
    if (!isOpen) {
      setForceOpen(false);
      // Reset callHasEnded only when fully closing
      if (!isMinimized) {
        setCallHasEnded(false);
      }
    }
  }, [isOpen, isMinimized]);

  const restoreModal = () => {
    if (typeof onRestore === 'function') {
      onRestore();
    } else {
      setForceOpen(true);
    }
    setIsMinimized(false);
  };

  // Allow rendering minimized UI or force-open even when parent `isOpen` is false
  if (!isOpen && !isMinimized && !forceOpen) return null;

  // Show modal fullscreen if isOpen or forceOpen, or just render minimized widget
  const showModal = (isOpen || forceOpen) && !isMinimized;

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Phone className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold">{providerName}</h2>
            <p className="text-blue-100 text-sm mt-1">Service Provider</p>
          </div>
        </div>

        {/* Call Status */}
        <div className="p-8 text-center">
          {/* Authentication Required - Show Login Prompt */}
          {isAuthenticated === false && (
            <div>
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <LogIn className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sign In to Call</h3>
              <p className="text-gray-600 mb-6">Create an account or sign in to connect with service providers</p>
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-3"
              >
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In to Call
                </span>
              </button>
            </div>
          )}

          {/* Regular Call Status - Only show if authenticated */}
          {isAuthenticated !== false && (
            <div>
              {/* Status Text */}
              <div className="mb-6">
            {callStatus === 'idle' && (
              <div>
                <p className="text-lg text-gray-700 font-medium">{statusMessage || 'Ready to call'}</p>
                {isInitializing && <p className="text-sm text-gray-500 mt-2 animate-pulse">Initializing...</p>}
              </div>
            )}
            {callStatus === 'connecting' && (
              <p className="text-lg text-blue-600 font-medium animate-pulse">Connecting...</p>
            )}
            {callStatus === 'ringing' && (
              <p className="text-lg text-blue-600 font-medium animate-pulse">Calling provider...</p>
            )}
            {callStatus === 'connected' && (
              <div>
                <p className="text-green-600 font-semibold text-lg mb-3">✓ Call Connected</p>
                <p className="text-4xl font-bold text-gray-800">{formatDuration(callDuration)}</p>
              </div>
            )}
            {callStatus === 'disconnected' && (
              <div>
                <p className="text-lg text-gray-700 font-medium">Call Ended</p>
                <p className="text-sm text-gray-500 mt-2">{statusMessage}</p>
              </div>
            )}
            {callStatus === 'busy' && (
              <div>
                <p className="text-lg text-orange-600 font-semibold">⚠ Provider is Busy</p>
                <p className="text-sm text-gray-600 mt-2">Please try again later</p>
              </div>
            )}
            {callStatus === 'rejected' && (
              <div>
                <p className="text-lg text-red-600 font-semibold">✗ Call Rejected</p>
                <p className="text-sm text-gray-600 mt-2">Provider declined the call</p>
              </div>
            )}
            {callStatus === 'no-answer' && (
              <div>
                <p className="text-lg text-orange-600 font-semibold">⚠ No Answer</p>
                <p className="text-sm text-gray-600 mt-2">Provider didn&apost;t answer</p>
              </div>
            )}
            {callStatus === 'failed' && (
              <div>
                <p className="text-lg text-red-600 font-semibold">✗ Call Failed</p>
                <p className="text-sm text-gray-600 mt-2">Provider unavailable</p>
              </div>
            )}
            {callStatus === 'error' && (
              <div>
                <p className="text-lg text-red-600 font-semibold">✗ Error</p>
                <p className="text-sm text-red-600 mt-2">{error || statusMessage}</p>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex justify-center items-center gap-4">
            {(callStatus === 'idle' || callStatus === 'error') && (
              <button
                onClick={makeCall}
                disabled={isInitializing || !!callRef.current}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full p-6 transition shadow-lg active:scale-95"
                title="Call"
              >
                <Phone className="w-8 h-8" />
              </button>
            )}

            {(callStatus === 'connecting' || callStatus === 'ringing' || callStatus === 'connected') && (
              <>
                {/* Mute Button */}
                {callStatus === 'connected' && (
                  <button
                    onClick={toggleMute}
                    className={`${
                      isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    } hover:bg-gray-200 rounded-full p-5 transition`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                )}

                {/* End Call Button */}
                <button
                  onClick={endCall}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full p-6 transition shadow-lg"
                  title="End Call"
                >
                  <PhoneOff className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && callStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center">
          <p className="text-xs text-gray-500">
            Powered by Twilio Voice
          </p>
        </div>
          </div>
        </div>
      )}

      {/* Minimized call widget */}
      {isMinimized && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="flex items-center gap-3 bg-white shadow rounded-full p-3">
            <button
              onClick={restoreModal}
              className="bg-blue-600 text-white p-3 rounded-full flex items-center justify-center"
              title="Restore call"
            >
              <Phone className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{providerName}</span>
              <span className="text-xs text-gray-500">{formatDuration(callDuration)}</span>
            </div>

            <button
              onClick={() => {
                // hang up and remove minimized widget
                endCall();
                setIsMinimized(false);
                setCallDuration(0);
                // Now close the modal
                onClose();
              }}
              className="ml-3 text-red-600 p-2 rounded-full"
              title="End call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

