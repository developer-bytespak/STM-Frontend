/**
 * Socket.IO Debug Helper
 * Use this in browser console to debug socket connections
 */

import { socketService } from './socketService';

export function debugSocket() {
  console.log('=== Socket.IO Debug Info ===');
  
  const socket = socketService.getSocket();
  
  console.log('Socket instance:', socket);
  console.log('Is connected:', socketService.isConnected());
  
  if (socket) {
    console.log('Socket ID:', socket.id);
    console.log('Socket connected:', socket.connected);
    console.log('Socket disconnected:', socket.disconnected);
    console.log('Transport:', (socket as any).io?.engine?.transport?.name);
    
    // Show active listeners
    console.log('Active event listeners:', Object.keys((socket as any)._callbacks || {}));
  } else {
    console.warn('⚠️ No socket instance found');
  }
  
  // Check environment
  console.log('\n=== Environment ===');
  console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
  console.log('Environment:', process.env.NODE_ENV);
  
  // Check cookies
  console.log('\n=== Authentication ===');
  const cookies = document.cookie.split(';').map(c => c.trim());
  const accessToken = cookies.find(c => c.startsWith('access_token='));
  console.log('Access token exists:', !!accessToken);
  console.log('Token preview:', accessToken ? accessToken.substring(0, 30) + '...' : 'Not found');
  
  return socket;
}

export function testSocketConnection() {
  console.log('🧪 Testing Socket Connection...\n');
  
  const socket = socketService.getSocket();
  
  if (!socket) {
    console.error('❌ No socket instance. Attempting to connect...');
    socketService.connect();
    setTimeout(testSocketConnection, 2000);
    return;
  }
  
  if (!socket.connected) {
    console.warn('⚠️ Socket not connected. Current status:', socket.disconnected ? 'Disconnected' : 'Connecting...');
    return;
  }
  
  console.log('✅ Socket connected successfully!');
  console.log('Socket ID:', socket.id);
  
  // Test events
  console.log('\n🔔 Setting up test listeners...');
  
  socket.once('test_response', (data: any) => {
    console.log('✅ Received test response:', data);
  });
  
  // Emit a test event (backend needs to handle this)
  console.log('📤 Sending test event...');
  socket.emit('test_event', { message: 'Hello from debug!' });
  
  console.log('\n✅ Test complete. Check logs above for results.');
}

export function monitorSocketEvents() {
  console.log('👂 Monitoring all socket events...');
  console.log('Press Ctrl+C in console to stop (or close this tab)\n');
  
  const socket = socketService.getSocket();
  
  if (!socket) {
    console.error('❌ No socket instance');
    return;
  }
  
  // Monitor all events
  const events = [
    'connect',
    'disconnect',
    'connect_error',
    'connected',
    'error',
    'joined_chat',
    'left_chat',
    'user_joined',
    'user_left',
    'new_message',
    'user_typing',
    'messages_read'
  ];
  
  events.forEach(eventName => {
    socket.on(eventName, (...args: any[]) => {
      console.log(`📡 [${eventName}]`, ...args);
    });
  });
  
  console.log('✅ Monitoring events:', events.join(', '));
}

export function clearSocketListeners() {
  console.log('🧹 Clearing all socket listeners...');
  
  const socket = socketService.getSocket();
  
  if (!socket) {
    console.error('❌ No socket instance');
    return;
  }
  
  socket.removeAllListeners();
  console.log('✅ All listeners cleared');
}

export function reconnectSocket() {
  console.log('🔄 Forcing socket reconnection...');
  
  socketService.disconnect();
  console.log('⏳ Disconnected. Waiting 1 second...');
  
  setTimeout(() => {
    socketService.connect();
    console.log('✅ Reconnection initiated. Check status with debugSocket()');
  }, 1000);
}

export function getSocketStats() {
  const socket = socketService.getSocket();
  
  if (!socket) {
    return {
      exists: false,
      connected: false,
      message: 'No socket instance'
    };
  }
  
  return {
    exists: true,
    connected: socket.connected,
    disconnected: socket.disconnected,
    id: socket.id,
    transport: (socket as any).io?.engine?.transport?.name,
    listeners: Object.keys((socket as any)._callbacks || {}).length,
  };
}

// Expose to window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).socketDebug = {
    debug: debugSocket,
    test: testSocketConnection,
    monitor: monitorSocketEvents,
    clear: clearSocketListeners,
    reconnect: reconnectSocket,
    stats: getSocketStats,
    service: socketService,
  };
  
  console.log(`
🛠️ Socket Debug Tools Loaded!

Available commands in browser console:
  
  socketDebug.debug()       - Show current socket status
  socketDebug.test()        - Test socket connection
  socketDebug.monitor()     - Monitor all socket events
  socketDebug.clear()       - Clear all socket listeners
  socketDebug.reconnect()   - Force reconnection
  socketDebug.stats()       - Get socket statistics
  socketDebug.service       - Access socketService directly

Examples:
  > socketDebug.debug()
  > socketDebug.test()
  > socketDebug.service.joinChat('chat-id-here')
  `);
}

