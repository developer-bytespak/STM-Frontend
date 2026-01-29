'use client';

import { useState, useEffect, useRef } from 'react';
import Linkify from 'react-linkify';
import { useChat } from '@/contexts/ChatContext';
import { useCall } from '@/contexts/CallContext';
import { useAuth } from '@/hooks/useAuth';
import { customerApi } from '@/api/customer';
import { chatApi, NegotiationHistoryResponse } from '@/api/chat';

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
  const { openCall } = useCall();
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [showLSMModal, setShowLSMModal] = useState(false);
  const [disputeDescription, setDisputeDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isNegotiationLoading, setIsNegotiationLoading] = useState(false);
  const [negotiation, setNegotiation] = useState<NegotiationHistoryResponse | null>(null);
  const [showNegotiationForm, setShowNegotiationForm] = useState(false);
  const [negotiationPrice, setNegotiationPrice] = useState<string>('');
  const [negotiationDate, setNegotiationDate] = useState<string>('');
  const [negotiationNotes, setNegotiationNotes] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  useEffect(() => {
    // Load negotiation state when a job-based chat opens
    const loadNegotiation = async () => {
      if (!activeConversation?.jobId) {
        setNegotiation(null);
        return;
      }
      try {
        setIsNegotiationLoading(true);
        const data = await chatApi.getNegotiationHistory(activeConversation.jobId);
        setNegotiation(data);
      } catch (error) {
        console.error('Failed to load negotiation history:', error);
      } finally {
        setIsNegotiationLoading(false);
      }
    };

    loadNegotiation();
  }, [activeConversation?.jobId]);

  // Keep negotiation banner in sync in real-time when new messages arrive
  useEffect(() => {
    const syncNegotiationWithMessages = async () => {
      if (!hasJob || !activeConversation?.jobId) return;
      try {
        const data = await chatApi.getNegotiationHistory(activeConversation.jobId);
        setNegotiation(data);
      } catch (error) {
        console.error('Failed to sync negotiation after new message:', error);
      }
    };

    // Trigger on message count changes for the active conversation
    syncNegotiationWithMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.messages.length]);

  if (!activeConversation) return null;

  const isMinimized = activeConversation.isMinimized;
  
  // Determine who the "other person" is based on current user's role
  const isProvider = user?.role === 'service_provider';
  const isCustomer = user?.role === 'customer';
  const isLSM = user?.role === 'local_service_manager';
  
  // For LSM: show both customer and provider names
  // For Customer/Provider: show the other party
  const otherPersonName = isLSM 
    ? `${activeConversation.customerName} ⟷ ${activeConversation.providerName}`
    : isProvider 
      ? activeConversation.customerName 
      : activeConversation.providerName;
  
  const otherPersonRole = isLSM ? 'Dispute' : isProvider ? 'Customer' : 'Provider';
  const otherPersonId = isProvider ? activeConversation.customerId : activeConversation.providerId;
  const hasJob = !!activeConversation.jobId;
  const hasPendingOffer =
    negotiation?.current_status === 'awaiting_response' &&
    negotiation.current_offer &&
    negotiation.current_offer.status === 'pending';
  const isOfferFromCurrentUser =
    hasPendingOffer &&
    user &&
    negotiation?.current_offer?.offered_by &&
    ((user.role === 'customer' && negotiation.current_offer.offered_by === 'customer') ||
      (user.role === 'service_provider' && negotiation.current_offer.offered_by === 'service_provider'));

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

  const resetNegotiationForm = () => {
    setNegotiationPrice('');
    setNegotiationDate('');
    setNegotiationNotes('');
  };

  const handleSendOffer = async () => {
    if (!hasJob || !activeConversation.jobId) return;

    if (!negotiationPrice && !negotiationDate) {
      alert('Please provide at least a price or date for the offer.');
      return;
    }

    try {
      setIsNegotiationLoading(true);
      await chatApi.sendNegotiationOffer({
        job_id: activeConversation.jobId,
        proposed_price: negotiationPrice ? Number(negotiationPrice) : undefined,
        proposed_date: negotiationDate || undefined,
        notes: negotiationNotes || undefined,
      });
      // Backend will push the formatted message via socket; just refresh state
      const data = await chatApi.getNegotiationHistory(activeConversation.jobId);
      setNegotiation(data);
      setShowNegotiationForm(false);
      resetNegotiationForm();
    } catch (error: any) {
      console.error('Failed to send offer:', error);
      alert(error?.message || 'Failed to send offer. Please try again.');
    } finally {
      setIsNegotiationLoading(false);
    }
  };

  const handleRespond = async (action: 'accept' | 'decline') => {
    if (!hasJob || !activeConversation.jobId) return;

    try {
      setIsNegotiationLoading(true);
      await chatApi.respondToNegotiationOffer({
        job_id: activeConversation.jobId,
        action,
      });
      const data = await chatApi.getNegotiationHistory(activeConversation.jobId);
      setNegotiation(data);
    } catch (error: any) {
      console.error('Failed to respond to offer:', error);
      alert(error?.message || 'Failed to respond to offer. Please try again.');
    } finally {
      setIsNegotiationLoading(false);
    }
  };

  const handleCounterOffer = async () => {
    if (!hasJob || !activeConversation.jobId) return;

    if (!negotiationPrice && !negotiationDate) {
      alert('Please provide at least a price or date for the counter offer.');
      return;
    }

    try {
      setIsNegotiationLoading(true);
      await chatApi.respondToNegotiationOffer({
        job_id: activeConversation.jobId,
        action: 'counter',
        counter_proposed_price: negotiationPrice ? Number(negotiationPrice) : undefined,
        counter_proposed_date: negotiationDate || undefined,
        counter_notes: negotiationNotes || undefined,
      });
      const data = await chatApi.getNegotiationHistory(activeConversation.jobId);
      setNegotiation(data);
      setShowNegotiationForm(false);
      resetNegotiationForm();
    } catch (error: any) {
      console.error('Failed to send counter offer:', error);
      alert(error?.message || 'Failed to send counter offer. Please try again.');
    } finally {
      setIsNegotiationLoading(false);
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

    if (!disputeDescription.trim()) {
      alert('Please provide a description of the dispute');
      return;
    }

    try {
      // File dispute through the API
      // This automatically:
      // 1. Creates a dispute record
      // 2. Locates the LSM for the provider's region
      // 3. Sends an invite notification to that LSM
      // 4. Updates the chat with lsm_invited = true
      const result = await customerApi.fileDispute({
        jobId: activeConversation.jobId,
        description: disputeDescription.trim()
      });

      console.log('✅ Dispute filed successfully:', result);
      
      // Show success message
      alert(
        result.message || 
        'Dispute filed successfully. The Local Service Manager for your region has been notified and will join the conversation shortly.'
      );
      
      setShowLSMModal(false);
      setDisputeDescription(''); // Clear the description
      
      // The LSM will appear in the chat automatically when they join via socket
      // No need to call addLSMToChat here - wait for actual join event
    } catch (error: any) {
      console.error('❌ Failed to file dispute:', error);
      alert(error.message || 'Failed to file dispute. Please try again.');
    }
  };

  // Handle voice call from chat
  const handleCallProvider = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // For customers calling provider
    if (isCustomer && activeConversation?.providerId) {
      openCall(
        activeConversation.providerName,
        String(activeConversation.providerId)
      );
    }
    // For providers calling customer (if needed)
    else if (isProvider && activeConversation?.customerId) {
      openCall(
        activeConversation.customerName,
        String(activeConversation.customerId)
      );
    }
  };

  const handleViewFile = (file: {name: string, url: string, type: string}) => {
    try {
      // Check if it's a base64 data URL
      if (file.url.startsWith('data:')) {
        // Create a blob from the base64 data
        const base64Data = file.url.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: file.type });
        const blobUrl = URL.createObjectURL(blob);
        
        // Open the blob URL in a new tab for viewing (not downloading)
        const newWindow = window.open(blobUrl, '_blank');
        
        // If the file can't be displayed in browser, show a message
        if (!newWindow) {
          alert('Unable to open file in browser. Please try downloading it instead.');
          URL.revokeObjectURL(blobUrl);
          return;
        }
        
        // Clean up the blob URL after a longer delay since user might be viewing
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 30000); // 30 seconds to allow viewing
      } else {
        // For regular URLs, open directly
        window.open(file.url, '_blank');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Unable to view this file. Please try downloading it instead.');
    }
  };

  const handleDownloadFile = (file: {name: string, url: string, type: string}) => {
    try {
      // Check if it's a base64 data URL
      if (file.url.startsWith('data:')) {
        // Create a blob from the base64 data
        const base64Data = file.url.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: file.type });
        const blobUrl = URL.createObjectURL(blob);
        
        // Create download link with proper filename
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = file.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL after download
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      } else {
        // For regular URLs, download directly
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Unable to download this file. Please try again.');
    }
  };

  // Helper function to get file icon based on file type
  const getFileIcon = (fileName: string, fileType: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // Image files
    if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    
    // PDF files
    if (fileType === 'application/pdf' || extension === 'pdf') {
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    
    // Word documents
    if (fileType.includes('word') || ['doc', 'docx'].includes(extension || '')) {
      return (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    
    // Excel files
    if (fileType.includes('excel') || fileType.includes('spreadsheet') || ['xls', 'xlsx'].includes(extension || '')) {
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    
    // Text files
    if (fileType === 'text/plain' || extension === 'txt') {
      return (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    
    // Default file icon
    return (
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  // Get message background color based on sender role (for LSM view)
  const getMessageColor = (senderRole: string, isOwnMessage: boolean | null) => {
    if (isOwnMessage) {
      return '#00a63e'; // Own messages stay green
    }
    
    // For LSM viewing: different colors for customer vs provider
    if (isLSM) {
      if (senderRole === 'customer') {
        return '#3b82f6'; // Blue for customer
      } else if (senderRole === 'service_provider') {
        return '#a855f7'; // Purple for provider
      }
    }
    
    // For customer/provider viewing: white background for other person
    return undefined; // Will use default white/border styling
  };

  const formatMessageContent = (content: string) => {
    // Convert markdown-style formatting to HTML
    return content.split('\n').map((line, idx) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) return null;
      
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

  const openImageGallery = (images: string[], index: number) => {
    setGalleryImages(images);
    setCurrentImageIndex(index);
    setImageGalleryOpen(true);
  };

  const closeImageGallery = () => {
    setImageGalleryOpen(false);
    setGalleryImages([]);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const downloadImage = async () => {
    try {
      const imageUrl = galleryImages[currentImageIndex];
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `job-image-${currentImageIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
      // Fallback: open in new tab
      window.open(galleryImages[currentImageIndex], '_blank');
    }
  };

  const renderImageGallery = (imageData: {images: string[], count: number}) => {
    const { images, count } = imageData;
    
    console.log('🎨 Rendering gallery with', count, 'images');
    
    // Single image - full width
    if (count === 1) {
      return (
        <div className="w-full">
          <div 
            onClick={() => openImageGallery(images, 0)}
            className="relative w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
            style={{ height: '240px' }}
          >
            <img 
              src={images[0]} 
              alt="Job image"
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                console.error('Failed to load image:', images[0]);
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="100" y="100" font-family="Arial" font-size="14" fill="%236b7280" text-anchor="middle" dominant-baseline="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>
      );
    }
    
    // 2 images - side by side
    if (count === 2) {
      return (
        <div className="w-full">
          <div className="grid grid-cols-2 gap-1">
            {images.map((url, idx) => (
              <div 
                key={idx}
                onClick={() => openImageGallery(images, idx)}
                className="relative w-full cursor-pointer hover:opacity-95 transition-opacity overflow-hidden rounded-lg"
                style={{ height: '160px' }}
              >
                <img 
                  src={url} 
                  alt={`Job image ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Failed to load image:', url);
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="100" y="100" font-family="Arial" font-size="14" fill="%236b7280" text-anchor="middle" dominant-baseline="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // 3 images - 1 large + 2 small
    if (count === 3) {
      return (
        <div className="w-full">
          <div className="grid grid-cols-2 gap-1">
            <div 
              onClick={() => openImageGallery(images, 0)}
              className="relative w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
              style={{ height: '322px' }}
            >
              <img 
                src={images[0]} 
                alt="Job image 1"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  console.error('Failed to load image:', images[0]);
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="100" y="100" font-family="Arial" font-size="14" fill="%236b7280" text-anchor="middle" dominant-baseline="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              {images.slice(1).map((url, idx) => (
                <div 
                  key={idx + 1}
                  onClick={() => openImageGallery(images, idx + 1)}
                  className="relative w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                  style={{ height: '160px' }}
                >
                  <img 
                    src={url} 
                    alt={`Job image ${idx + 2}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Failed to load image:', url);
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="100" y="100" font-family="Arial" font-size="14" fill="%236b7280" text-anchor="middle" dominant-baseline="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // 4+ images - Grid with "+X more" overlay
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 gap-1">
          {images.slice(0, 4).map((url, idx) => (
            <div 
              key={idx}
              onClick={() => openImageGallery(images, idx)}
              className="relative w-full cursor-pointer hover:opacity-95 transition-opacity overflow-hidden rounded-lg"
              style={{ height: '160px' }}
            >
              <img 
                src={url} 
                alt={`Job image ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  console.error('Failed to load image:', url);
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="100" y="100" font-family="Arial" font-size="14" fill="%236b7280" text-anchor="middle" dominant-baseline="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
                }}
              />
              {idx === 3 && count > 4 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">+{count - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Preview Minimized State - Button style like the attached image
  if (isPreviewMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={maximizeConversation}
          className="bg-navy-600 text-white px-4 sm:px-6 py-3 rounded-lg shadow-2xl hover:bg-navy-700 transition-colors flex items-center gap-2 sm:gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 bg-white text-navy-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
            {otherPersonName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="text-left hidden sm:block">
            <p className="font-semibold text-sm">{otherPersonName}</p>
            <p className="text-xs text-navy-200">Click to open chat</p>
          </div>
        </button>
      </div>
    );
  }

  // Compact Minimized State - Still functional chat but smaller
  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 w-full sm:w-80 h-[450px] sm:h-[400px] bg-white sm:rounded-lg shadow-2xl border-t sm:border border-gray-200 flex flex-col z-50">
        {/* Header */}
        <div className="bg-navy-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-navy-600 rounded-full flex items-center justify-center font-bold text-xs">
              {otherPersonName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-semibold text-sm text-left">
                {otherPersonName}
              </div>
              <p className="text-xs text-navy-200">{otherPersonRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Call Button - For customers calling provider (compact view) */}
            {isCustomer && (
              <button
                onClick={handleCallProvider}
                className="text-white hover:bg-navy-700 p-2 rounded transition-colors cursor-pointer"
                title="Call provider"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            )}
        <button
          onClick={maximizeConversation}
              className="text-white hover:bg-navy-700 p-2 rounded transition-colors cursor-pointer"
              title="Maximize to full chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              onClick={closeConversation}
              className="text-white hover:bg-navy-700 p-2 rounded transition-colors cursor-pointer"
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

        {/* Negotiation banner - Compact (only for job chats) */}
        {hasJob && (
          <div className="border-b border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">Job Negotiation</span>
              <button
                type="button"
                onClick={() => setShowNegotiationForm((prev) => !prev)}
                className="text-[11px] px-2 py-1 rounded border border-navy-500 text-navy-600 hover:bg-navy-50 cursor-pointer"
              >
                {showNegotiationForm ? 'Close' : 'New offer'}
              </button>
            </div>
            {isNegotiationLoading && (
              <p className="text-[11px] text-gray-500">Loading negotiation...</p>
            )}
            {hasPendingOffer && negotiation?.current_offer && (
              <div className="mt-1 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 space-y-1">
                <p className="text-[11px] font-semibold text-amber-800">
                  {isOfferFromCurrentUser
                    ? 'You sent an offer. Waiting for response.'
                    : `Pending offer from ${
                        negotiation.current_offer.offered_by_name || negotiation.current_offer.offered_by
                      }`}
                </p>
                <p className="text-[11px] text-amber-900">
                  💰 {negotiation.current_offer.proposed_price ?? negotiation.current_offer.original_price}
                  {negotiation.current_offer.proposed_date && (
                    <>
                      {' '}
                      · 📅{' '}
                      {new Date(negotiation.current_offer.proposed_date).toLocaleDateString()}
                    </>
                  )}
                </p>
                {!isOfferFromCurrentUser && (
                  <div className="flex gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => handleRespond('accept')}
                      disabled={isNegotiationLoading}
                      className="flex-1 text-[11px] px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond('decline')}
                      disabled={isNegotiationLoading}
                      className="flex-1 text-[11px] px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNegotiationForm(true)}
                      disabled={isNegotiationLoading}
                      className="flex-1 text-[11px] px-2 py-1 rounded bg-navy-600 text-white hover:bg-navy-700 disabled:opacity-60 cursor-pointer"
                    >
                      Counter
                    </button>
                  </div>
                )}
              </div>
            )}
            {showNegotiationForm && (
              <div className="mt-1 bg-gray-50 border border-gray-200 rounded px-2 py-2 space-y-1">
                <div className="flex gap-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="Price"
                    value={negotiationPrice}
                    onChange={(e) => setNegotiationPrice(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-[11px] text-gray-900"
                  />
                  <input
                    type="date"
                    value={negotiationDate}
                    onChange={(e) => setNegotiationDate(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-[11px] text-gray-900"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Notes (optional)"
                  value={negotiationNotes}
                  onChange={(e) => setNegotiationNotes(e.target.value)}
                  className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-[11px] text-gray-900 resize-none"
                />
                <div className="flex gap-1 mt-1">
                  {hasPendingOffer && !isOfferFromCurrentUser ? (
                    <button
                      type="button"
                      onClick={handleCounterOffer}
                      disabled={isNegotiationLoading}
                      className="flex-1 text-[11px] px-2 py-1 rounded bg-navy-600 text-white hover:bg-navy-700 disabled:opacity-60 cursor-pointer"
                    >
                      Send counter
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOffer}
                      disabled={isNegotiationLoading}
                      className="flex-1 text-[11px] px-2 py-1 rounded bg-navy-600 text-white hover:bg-navy-700 disabled:opacity-60 cursor-pointer"
                    >
                      Send offer
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages - Compact */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
          {activeConversation.messages.map((message, index) => {
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
              <div key={`${message.id}-${index}`} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`${isOwnMessage ? (message.type === 'image' || (message.content && message.content.includes('"images":'))) ? 'order-2 w-full' : 'order-2 max-w-[80%]' : (message.type === 'form-data' || message.type === 'image' || (message.content && message.content.includes('"images":'))) ? 'order-1 w-full' : 'order-1 max-w-[80%]'}`}>
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
                      message.type === 'image' || (message.content && message.content.includes('"images"'))
                        ? 'px-0 py-0'
                        : isOwnMessage
                        ? 'text-white rounded-br-none px-3 py-2'
                        : message.type === 'form-data'
                        ? 'rounded-bl-none px-3 py-3'
                        : getMessageColor(message.senderRole, isOwnMessage)
                        ? 'rounded-bl-none text-white px-3 py-2'
                        : 'bg-white border border-gray-200 rounded-bl-none text-gray-900 px-3 py-2'
                    }`}
                    style={
                      message.type === 'image' || (message.content && message.content.includes('"images"'))
                        ? undefined
                        : isOwnMessage || message.type === 'form-data'
                        ? { backgroundColor: '#00a63e' } 
                        : getMessageColor(message.senderRole, isOwnMessage)
                        ? { backgroundColor: getMessageColor(message.senderRole, isOwnMessage) }
                        : undefined
                    }
                  >
                    {message.type === 'form-data' ? (
                      <div className="text-gray-900 w-full">
                        {formatMessageContent(message.content)}
                      </div>
                    ) : message.type === 'image' || (message.content && message.content.includes('"images":')) ? (
                      <div className="w-full">
                        {(() => {
                          try {
                            console.log('🖼️ Image message detected:', message.content);
                            const imageData = JSON.parse(message.content);
                            console.log('📊 Parsed image data:', imageData);
                            if (!imageData.images || !Array.isArray(imageData.images) || imageData.images.length === 0) {
                              console.error('❌ Invalid image data structure:', imageData);
                              return <p className="text-white text-xs">No images found</p>;
                            }
                            return renderImageGallery(imageData);
                          } catch (e) {
                            console.error('❌ Failed to parse image data:', e, message.content);
                            return <p className="text-white text-xs">Failed to load images</p>;
                          }
                        })()}
                      </div>
                    ) : message.type === 'file' && message.files ? (
                      <div>
                        {message.content !== 'Sent file(s)' && (
                          <p className={`text-xs mb-1 ${getMessageColor(message.senderRole, isOwnMessage) ? 'text-white' : 'text-gray-900'}`}>{message.content}</p>
                        )}
                        <div className="space-y-2">
                          {message.files.map((file, idx) => (
                            <div key={idx} className="bg-white rounded border border-gray-200 p-2">
                              <div className="flex items-center gap-2">
                                {getFileIcon(file.name, file.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs text-gray-900 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <div className="flex gap-1 mt-2">
                                <button
                                  onClick={() => handleViewFile(file)}
                                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors flex items-center justify-center gap-1"
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
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors flex items-center justify-center gap-1"
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
                      <Linkify
                        componentDecorator={(decoratedHref: string, decoratedText: string, key: number) => (
                          <a
                            key={key}
                            href={decoratedHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline cursor-pointer break-all"
                          >
                            {decoratedText}
                          </a>
                        )}
                      >
                        <p className={`text-xs whitespace-pre-wrap break-words overflow-wrap-anywhere ${isOwnMessage || getMessageColor(message.senderRole, isOwnMessage) ? 'text-white' : 'text-gray-900'}`}>{message.content}</p>
                      </Linkify>
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm text-gray-900"
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
      {/* Chat Popup - Full Size - Responsive: full screen on mobile, popup on desktop */}
      <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 w-full sm:w-[420px] h-full sm:h-[600px] bg-white sm:rounded-lg shadow-2xl border-t sm:border border-gray-200 flex flex-col z-50">
        {/* Header */}
        <div className="bg-navy-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-navy-600 rounded-full flex items-center justify-center font-bold text-sm">
              {otherPersonName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-semibold text-sm text-left">
                {otherPersonName}
              </div>
              <p className="text-xs text-navy-200">{otherPersonRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Call Button - For customers calling provider */}
            {isCustomer && (
              <button
                onClick={handleCallProvider}
                className="text-white hover:bg-navy-700 p-2 rounded transition-colors cursor-pointer"
                title="Call provider"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            )}
            {!activeConversation.lsmId && (
              <button
                onClick={() => setShowLSMModal(true)}
                className="text-white hover:bg-navy-700 p-2 rounded transition-colors cursor-pointer"
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
              className="text-white hover:bg-navy-700 p-2 rounded transition-colors cursor-pointer"
              title="Minimize chat (original)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={minimizeToCompact}
              className="text-white hover:bg-navy-700 p-2 rounded transition-colors cursor-pointer"
              title="Minimize to compact chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              onClick={closeConversation}
              className="text-white hover:bg-navy-700 p-2 rounded transition-colors cursor-pointer"
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

        {/* Negotiation banner - Full (only for job chats) */}
        {hasJob && (
          <div className="border-b border-gray-200 bg-white px-4 py-3 text-xs sm:text-sm text-gray-700 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">Job Negotiation</span>
              <button
                type="button"
                onClick={() => setShowNegotiationForm((prev) => !prev)}
                className="text-xs px-3 py-1 rounded border border-navy-500 text-navy-600 hover:bg-navy-50 cursor-pointer"
              >
                {showNegotiationForm ? 'Close' : 'New offer'}
              </button>
            </div>
            {isNegotiationLoading && (
              <p className="text-xs text-gray-500">Loading negotiation...</p>
            )}
            {hasPendingOffer && negotiation?.current_offer && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded px-3 py-2 space-y-1">
                <p className="text-xs font-semibold text-amber-800">
                  {isOfferFromCurrentUser
                    ? 'You sent an offer. Waiting for response.'
                    : `Pending offer from ${
                        negotiation.current_offer.offered_by_name || negotiation.current_offer.offered_by
                      }`}
                </p>
                <p className="text-xs text-amber-900">
                  💰 {negotiation.current_offer.proposed_price ?? negotiation.current_offer.original_price}
                  {negotiation.current_offer.proposed_date && (
                    <>
                      {' '}
                      · 📅{' '}
                      {new Date(negotiation.current_offer.proposed_date).toLocaleDateString()}
                    </>
                  )}
                </p>
                {!isOfferFromCurrentUser && (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleRespond('accept')}
                      disabled={isNegotiationLoading}
                      className="flex-1 text-xs px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond('decline')}
                      disabled={isNegotiationLoading}
                      className="flex-1 text-xs px-3 py-1.5 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNegotiationForm(true)}
                      disabled={isNegotiationLoading}
                      className="flex-1 text-xs px-3 py-1.5 rounded bg-navy-600 text-white hover:bg-navy-700 disabled:opacity-60 cursor-pointer"
                    >
                      Counter
                    </button>
                  </div>
                )}
              </div>
            )}
            {showNegotiationForm && (
              <div className="mt-2 bg-gray-50 border border-gray-200 rounded px-3 py-2 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Price"
                    value={negotiationPrice}
                    onChange={(e) => setNegotiationPrice(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-900"
                  />
                  <input
                    type="date"
                    value={negotiationDate}
                    onChange={(e) => setNegotiationDate(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-900"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Notes (optional)"
                  value={negotiationNotes}
                  onChange={(e) => setNegotiationNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-900 resize-none"
                />
                <div className="flex gap-2 mt-1">
                  {hasPendingOffer && !isOfferFromCurrentUser ? (
                    <button
                      type="button"
                      onClick={handleCounterOffer}
                      disabled={isNegotiationLoading}
                      className="flex-1 text-xs px-3 py-1.5 rounded bg-navy-600 text-white hover:bg-navy-700 disabled:opacity-60 cursor-pointer"
                    >
                      Send counter
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOffer}
                      disabled={isNegotiationLoading}
                      className="flex-1 text-xs px-3 py-1.5 rounded bg-navy-600 text-white hover:bg-navy-700 disabled:opacity-60 cursor-pointer"
                    >
                      Send offer
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-gray-50">
          {activeConversation.messages.map((message, index) => {
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
              <div key={`${message.id}-${index}`} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`${isOwnMessage ? (message.type === 'image' || (message.content && message.content.includes('"images":'))) ? 'order-2 w-full' : 'order-2 max-w-[80%]' : (message.type === 'form-data' || message.type === 'image' || (message.content && message.content.includes('"images":'))) ? 'order-1 w-full' : 'order-1 max-w-[80%]'}`}>
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
                      message.type === 'image' || (message.content && message.content.includes('"images"'))
                        ? 'px-0 py-0'
                        : isOwnMessage
                        ? 'text-white rounded-br-none px-4 py-3'
                        : message.type === 'form-data'
                        ? 'rounded-bl-none px-3 py-4'
                        : getMessageColor(message.senderRole, isOwnMessage)
                        ? 'rounded-bl-none text-white px-4 py-3'
                        : 'bg-white border border-gray-200 rounded-bl-none text-gray-900 px-4 py-3'
                    }`}
                    style={
                      message.type === 'image' || (message.content && message.content.includes('"images"'))
                        ? undefined
                        : isOwnMessage || message.type === 'form-data'
                        ? { backgroundColor: '#00a63e' } 
                        : getMessageColor(message.senderRole, isOwnMessage)
                        ? { backgroundColor: getMessageColor(message.senderRole, isOwnMessage) }
                        : undefined
                    }
                  >
                    {message.type === 'form-data' ? (
                      <div className="text-gray-900 w-full">
                        {formatMessageContent(message.content)}
                      </div>
                    ) : message.type === 'image' || (message.content && message.content.includes('"images":')) ? (
                      <div className="w-full">
                        {(() => {
                          try {
                            console.log('🖼️ Image message detected (maximized):', message.content);
                            const imageData = JSON.parse(message.content);
                            console.log('📊 Parsed image data (maximized):', imageData);
                            if (!imageData.images || !Array.isArray(imageData.images) || imageData.images.length === 0) {
                              console.error('❌ Invalid image data structure (maximized):', imageData);
                              return <p className="text-white text-sm">No images found</p>;
                            }
                            return renderImageGallery(imageData);
                          } catch (e) {
                            console.error('❌ Failed to parse image data (maximized):', e, message.content);
                            return <p className="text-white text-sm">Failed to load images</p>;
                          }
                        })()}
                      </div>
                    ) : message.type === 'file' && message.files ? (
                      <div>
                        {message.content !== 'Sent file(s)' && (
                          <p className={`text-sm mb-2 ${getMessageColor(message.senderRole, isOwnMessage) ? 'text-white' : 'text-gray-900'}`}>{message.content}</p>
                        )}
                        <div className="space-y-3">
                          {message.files.map((file, idx) => (
                            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                              <div className="flex items-center gap-3">
                                {getFileIcon(file.name, file.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-gray-900 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleViewFile(file)}
                                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                      <Linkify
                        componentDecorator={(decoratedHref: string, decoratedText: string, key: number) => (
                          <a
                            key={key}
                            href={decoratedHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline cursor-pointer break-all"
                          >
                            {decoratedText}
                          </a>
                        )}
                      >
                        <p className={`text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere ${isOwnMessage || getMessageColor(message.senderRole, isOwnMessage) ? 'text-white' : 'text-gray-900'}`}>{message.content}</p>
                      </Linkify>
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
              className="text-gray-500 hover:text-navy-600 p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-gray-900"
            />
            <button
              type="submit"
              disabled={!messageInput.trim() && selectedFiles.length === 0}
              className="bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
          <div className="bg-white rounded-lg max-w-md w-full mx-2 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Add Local Service Manager</h3>
            </div>
            
            <div className="mb-6 space-y-3">
              <p className="text-gray-700">
                Filing a dispute will automatically invite the Local Service Manager (LSM) for your region to join this conversation.
              </p>
              
              <div className="space-y-2">
                <label htmlFor="dispute-description" className="block text-sm font-semibold text-gray-700">
                  Describe the issue: <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="dispute-description"
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="E.g., Work not completed according to agreement, poor quality, missed deadline..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 resize-none text-gray-900 placeholder-gray-900"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 text-right">
                  {disputeDescription.length}/500 characters
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong className="font-semibold">What happens next:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                  <li>The regional LSM will be notified</li>
                  <li>They will review your dispute description</li>
                  <li>LSM will join the chat to help mediate</li>
                  <li>Both parties will work towards a resolution</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAddLSM}
                className="flex-1 bg-navy-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-navy-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                File Dispute & Add LSM
              </button>
              <button
                onClick={() => {
                  setShowLSMModal(false);
                  setDisputeDescription(''); // Clear on cancel
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Lightbox */}
      {imageGalleryOpen && (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeImageGallery}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 cursor-pointer"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {currentImageIndex + 1} / {galleryImages.length}
          </div>

          {/* Previous button */}
          {galleryImages.length > 1 && (
            <button
              onClick={previousImage}
              className="absolute left-4 text-white hover:text-gray-300 cursor-pointer"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Main image */}
          <div className="max-w-7xl max-h-screen w-full h-full flex items-center justify-center p-4">
            <img 
              src={galleryImages[currentImageIndex]} 
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23333"/%3E%3Ctext x="200" y="200" font-family="Arial" font-size="20" fill="%23fff" text-anchor="middle" dominant-baseline="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>

          {/* Next button */}
          {galleryImages.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 text-white hover:text-gray-300 cursor-pointer"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Thumbnail strip at bottom */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg max-w-full overflow-x-auto">
              {galleryImages.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-16 h-16 rounded cursor-pointer overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === currentImageIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={url} 
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Download button */}
          <button
            onClick={downloadImage}
            className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      )}
    </>
  );
}