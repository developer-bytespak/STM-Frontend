'use client';

/**
 * EXAMPLE: How to integrate Socket.IO chat with your job booking flow
 * 
 * This file shows how to:
 * 1. Create a chat when booking a service
 * 2. Open an existing chat from a job card
 * 3. Show connection status
 * 
 * Copy the patterns you need into your actual components!
 */

import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';

// ==========================================
// EXAMPLE 1: Create Chat from Booking
// ==========================================

interface BookingFormData {
  serviceType: string;
  description: string;
  budget: string;
  preferredDate?: string;
  urgency?: string;
}

export function BookingWithChatExample() {
  const { createConversation, isSocketConnected } = useChat();
  const { user } = useAuth();
  const [isBooking, setIsBooking] = useState(false);

  const handleBookingWithChat = async (
    providerId: number,
    providerName: string,
    bookingData: BookingFormData
  ) => {
    if (!user) {
      alert('Please log in to book a service');
      return;
    }

    setIsBooking(true);

    try {
      // STEP 1: Create job in your backend
      // Replace this with your actual API call
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          customerId: user.id,
          serviceType: bookingData.serviceType,
          description: bookingData.description,
          // ... other job data
        }),
      });

      const jobData = await response.json();

      // STEP 2: Your backend should return chatId
      // The chat is created automatically when job is created
      const chatId = jobData.chatId;  // UUID from backend
      const jobId = jobData.jobId;    // Job ID from backend

      if (!chatId) {
        throw new Error('Chat ID not returned from backend');
      }

      // STEP 3: Open the chat in UI
      createConversation(
        providerId,
        providerName,
        bookingData,
        jobId,
        chatId  // Pass the real chatId from backend
      );

      console.log('✅ Job created and chat opened:', { jobId, chatId });
      alert('Booking successful! Chat is now open.');

    } catch (error) {
      console.error('❌ Booking failed:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-bold mb-2">Example: Booking with Chat</h3>
      
      {/* Connection Status */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${
          isSocketConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm">
          {isSocketConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      {/* Example Button */}
      <button
        onClick={() => handleBookingWithChat(
          123, // Provider ID
          'John\'s Cleaning Service', // Provider Name
          {
            serviceType: 'House Cleaning',
            description: 'Need deep cleaning for 3 bedrooms',
            budget: '150',
            urgency: 'This week'
          }
        )}
        disabled={isBooking || !isSocketConnected}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isBooking ? 'Booking...' : 'Book Service & Chat'}
      </button>

      <p className="text-xs text-gray-500 mt-2">
        This will create a job and open a chat window
      </p>
    </div>
  );
}

// ==========================================
// EXAMPLE 2: Open Existing Chat from Job Card
// ==========================================

interface Job {
  id: number;
  service: {
    name: string;
  };
  provider: {
    id: number;
    businessName: string;
  };
  status: string;
  chatId?: string; // If your job model includes chatId
}

export function JobCardWithChatExample({ job }: { job: Job }) {
  const { openConversationByJobId, conversations } = useChat();

  const handleOpenChat = () => {
    // Try to open chat by job ID
    const found = openConversationByJobId(job.id);
    
    if (found) {
      console.log('✅ Chat opened for job:', job.id);
    } else {
      console.log('❌ No chat found for this job');
      alert('Chat not found. Please create a new conversation.');
    }
  };

  // Check if chat exists for this job
  const chatExists = conversations.some(conv => conv.jobId === job.id);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-bold">{job.service.name}</h3>
      <p className="text-sm text-gray-600">Provider: {job.provider.businessName}</p>
      <p className="text-sm text-gray-600">Status: {job.status}</p>
      
      <button
        onClick={handleOpenChat}
        disabled={!chatExists}
        className="mt-2 bg-green-600 text-white px-4 py-2 rounded text-sm disabled:bg-gray-400"
      >
        {chatExists ? 'Open Chat' : 'No Chat Available'}
      </button>
    </div>
  );
}

// ==========================================
// EXAMPLE 3: Connection Status Indicator
// ==========================================

export function SocketConnectionIndicator() {
  const { isSocketConnected } = useChat();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg ${
        isSocketConnected
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isSocketConnected ? 'bg-green-600 animate-pulse' : 'bg-red-600'
        }`} />
        <span className="text-sm font-medium">
          {isSocketConnected ? 'Chat Connected' : 'Reconnecting...'}
        </span>
      </div>
    </div>
  );
}

// ==========================================
// EXAMPLE 4: Integration with Your Booking Modal
// ==========================================

interface BookingModalProps {
  provider: {
    id: number;
    businessName: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  service: {
    id: number;
    name: string;
  };
  onClose: () => void;
}

export function BookingModalWithChatExample({ provider, service, onClose }: BookingModalProps) {
  const { createConversation } = useChat();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    description: '',
    budget: '',
    preferredDate: '',
  });

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Call your backend to create job
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          serviceId: service.id,
          description: formData.description,
          budget: formData.budget,
          preferredDate: formData.preferredDate,
        }),
      });

      const data = await response.json();

      // 2. Open chat with the returned chatId
      createConversation(
        provider.id,
        provider.businessName,
        {
          serviceType: service.name,
          description: formData.description,
          budget: formData.budget,
          preferredDate: formData.preferredDate,
        },
        data.jobId,
        data.chatId  // Important: Chat ID from backend
      );

      // 3. Close modal
      onClose();

      alert('Booking created! Chat window is now open.');
    } catch (error) {
      console.error('Failed to create booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Book {service.name}</h2>
        <p className="text-gray-600 mb-4">
          Provider: {provider.businessName}
        </p>

        <form onSubmit={handleSubmitBooking} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Budget ($)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Preferred Date
            </label>
            <input
              type="date"
              value={formData.preferredDate}
              onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700"
            >
              Book & Chat
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// HOW TO USE THESE EXAMPLES:
// ==========================================
/*

1. Copy the pattern you need into your actual component
2. Replace placeholder API calls with your real endpoints
3. Ensure your backend returns chatId when creating jobs
4. Test with real data

Example in your actual booking page:

import { useChat } from '@/contexts/ChatContext';

function MyBookingPage() {
  const { createConversation } = useChat();
  
  const handleBook = async (data) => {
    const result = await createJobAPI(data);
    
    createConversation(
      result.providerId,
      result.providerName,
      formData,
      result.jobId,
      result.chatId  // From your backend
    );
  };
  
  return <YourBookingUI />;
}

*/

