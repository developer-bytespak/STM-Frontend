'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { aiChatApi, AiChatSession, AiChatMessage, RecommendedProvider } from '@/api/ai-chat';
import { homepageApi } from '@/api/homepage';
import { generateProviderSlug } from '@/lib/slug';
import AlertModal from '@/components/ui/AlertModal';
import { 
  isValidZipcode, 
  isValidBudget,
  validateBudgetAsync,
  sanitizeInput, 
  isQuestion, 
  fuzzyMatchService, 
  isVagueRequest 
} from '@/lib/validation';

interface SalesAssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// Hardcoded first messages displayed randomly
const INITIAL_MESSAGES = [
  "I am SPS Sales Assistant. How can I help you today?",
  "What services are you looking for? I'm here to assist!",
  "Hello! What can I help you find today?",
  "Welcome to SPS! Tell me what services you need.",
  "Hi there! How may I assist you today?",
];

// Suggested questions to guide new users
const SUGGESTED_QUESTIONS = [
  "I need house cleaning services in my area",
  "What plumbing services do you offer?",
  "I'm looking for a handyman for home repairs",
  "Can you help me find a lawn care service?",
  "I need electrical work done at my home",
  "Show me available office cleaning services",
];

interface ServiceInfo {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface CollectedData {
  service: string | null;
  budget: string | null;
  zipcode: string | null;
  location: string | null;
  requirements: string | null;
}

export default function SalesAssistantChat({ isOpen, onClose }: SalesAssistantChatProps) {
  const router = useRouter();
  const [session, setSession] = useState<AiChatSession | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendedProviders, setRecommendedProviders] = useState<RecommendedProvider[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [showSessionPrompt, setShowSessionPrompt] = useState(false);
  const [collectedData, setCollectedData] = useState<CollectedData>({
    service: null,
    budget: null,
    zipcode: null,
    location: null,
    requirements: null,
  });
  const [firstMessageShown, setFirstMessageShown] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [serviceSearchFilter, setServiceSearchFilter] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editMode, setEditMode] = useState<'service' | 'zipcode' | 'budget' | 'requirements' | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const MAX_MESSAGES = 100;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const manuallyEditedFields = useRef<Set<keyof CollectedData>>(new Set());
  const previousMessageCount = useRef<number>(0);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<AiChatSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const servicesInitializedRef = useRef(false);

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
  });

  const showError = (message: string, title: string = 'Error') => {
    setAlertModal({ isOpen: true, title, message, type: 'error' });
  };

  const showWarning = (message: string, title: string = 'Warning') => {
    setAlertModal({ isOpen: true, title, message, type: 'warning' });
  };

  const showInfo = (message: string, title: string = 'Information') => {
    setAlertModal({ isOpen: true, title, message, type: 'info' });
  };

  const closeAlertModal = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [showImageUploadPrompt, setShowImageUploadPrompt] = useState(false);
  const [imageUploadSkipped, setImageUploadSkipped] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Check if image upload prompt should be shown
  const shouldShowImageUploadPrompt = 
    collectedData.service &&
    collectedData.zipcode &&
    collectedData.budget &&
    uploadedImages.length === 0 &&
    !imageUploadSkipped &&
    !showRecommendations &&
    !showConfirmation &&
    !showImageUploadModal;

  // Handle image file selection
  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate total count
    if (selectedImageFiles.length + files.length > MAX_IMAGES) {
      showWarning(`Maximum ${MAX_IMAGES} images allowed`, 'Upload Limit');
      return;
    }
    
    // Validate each file
    const validFiles: File[] = [];
    
    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        showWarning(`${file.name} is too large (max 5MB)`, 'File Too Large');
        continue;
      }
      
      // Check file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        showWarning(`${file.name} is not a supported format (JPG, PNG, GIF, WEBP)`, 'Invalid Format');
        continue;
      }
      
      validFiles.push(file);
    }
    
    // Create previews for valid files
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    setSelectedImageFiles((prev) => [...prev, ...validFiles]);
  };

  // Remove selected image before upload
  const handleRemoveSelectedImage = (index: number) => {
    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove uploaded image
  const handleRemoveUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload images to server
  const handleUploadImages = async () => {
    if (selectedImageFiles.length === 0) {
      showWarning('Please select at least one image', 'No Images Selected');
      return;
    }

    setIsUploadingImages(true);

    try {
      console.log('Uploading', selectedImageFiles.length, 'images...');
      
      const response = await aiChatApi.uploadImages(selectedImageFiles);
      
      console.log('Upload successful:', response.imageUrls);
      
      // Store image URLs in state
      setUploadedImages(response.imageUrls);
      
      // Clear selection
      setSelectedImageFiles([]);
      setImagePreviews([]);
      setShowImageUploadModal(false);
      
      // Add AI message acknowledging the upload
      const aiMessage: AiChatMessage = {
        id: `ai-${Date.now()}`,
        senderType: 'assistant',
        message: `✅ Great! I've received ${response.imageUrls.length} image${response.imageUrls.length > 1 ? 's' : ''}. These will be shared with the provider you select. Now let me find the best providers for your ${collectedData.service} needs.`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      showError(error.message || 'Failed to upload images. Please try again.', 'Upload Error');
    } finally {
      setIsUploadingImages(false);
    }
  };

  // Skip image upload
  const handleSkipImageUpload = () => {
    setImageUploadSkipped(true);
    setShowImageUploadPrompt(false);
    
    // Add AI message
    const aiMessage: AiChatMessage = {
      id: `ai-${Date.now()}`,
      senderType: 'assistant',
      message: `No problem! Let me find the best providers for your ${collectedData.service} needs.`,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMessage]);
  };

  // Fetch available services on mount - ONLY ONCE
  useEffect(() => {
    // Prevent duplicate fetches
    if (servicesInitializedRef.current) return;
    servicesInitializedRef.current = true;

    const fetchServices = async () => {
      try {
        const allServices = await homepageApi.getAllServices();
        console.log('Services fetched successfully:', allServices);
        if (allServices && allServices.length > 0) {
          setServices(allServices);
        } else {
          console.warn('No services returned, using fallback');
          // Fallback to empty array - will still work with AI
          setServices([]);
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
        // Fallback to empty if fetch fails - AI can still help
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Load active session on mount
  useEffect(() => {
    if (isOpen) {
      loadActiveSession();
    }
  }, [isOpen]);

  // Check if returning from provider and restore session
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('ai_chat_session_id');
    if (storedSessionId && !session && !showSessionPrompt) {
      // Attempt to restore the stored session
      loadStoredSession(storedSessionId);
      sessionStorage.removeItem('ai_chat_session_id');
    }
  }, [isOpen, session]);

  // Helper: Check if all required data is collected
  // Requirements is now OPTIONAL - only Service, Budget, and Zipcode are mandatory
  const isRequiredDataComplete = (): boolean => {
    return !!(
      collectedData.service &&
      collectedData.budget &&
      collectedData.zipcode
    );
  };

  // Helper: Find services matching a keyword (for clarification when multiple matches exist)
  const findMatchingServices = (keyword: string): ServiceInfo[] => {
    const keywordLower = keyword.toLowerCase();
    return services.filter((service) => {
      const serviceLower = service.name.toLowerCase();
      return (
        serviceLower.includes(keywordLower) ||
        keywordLower.includes(serviceLower.split(/\s+/)[0])
      );
    });
  };

  // Helper: Extract data from user messages with proper priority
  const extractDataFromMessages = (newMessage: string): Partial<CollectedData> => {
    const extracted: Partial<CollectedData> = {};
    const text = sanitizeInput(newMessage).toLowerCase();
    const originalText = sanitizeInput(newMessage);

    // DO NOT auto-extract service from text - service must be selected via buttons only
    // This prevents incorrect auto-selection like "Windshield Technician"

    // 1. Extract zipcode FIRST (5 consecutive digits, highest priority)
    // Zipcodes are typically mentioned as standalone 5-digit numbers
    const zipcodeMatch = originalText.match(/\b\d{5}(?:-\d{4})?\b/);
    if (zipcodeMatch && isValidZipcode(zipcodeMatch[0])) {
      extracted.zipcode = zipcodeMatch[0];
    }

    // 2. Extract budget with multiple formats and validation
    // Pattern: "$X", "X dollars", "X$", "budget of X", "costs X", etc.
    let budgetMatch = null;
    
    // Try "$200" or "$300$" format
    budgetMatch = originalText.match(/\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\$?/);
    if (budgetMatch) {
      // Make sure it's not the zipcode (budget should be reasonable amount)
      const amount = budgetMatch[1].replace(/,/g, '');
      if (amount !== extracted.zipcode) {
        const validation = isValidBudget(amount);
        if (validation.valid) {
          extracted.budget = '$' + amount;
        }
      }
    }
    
    // If no $ sign found, try other patterns
    if (!extracted.budget) {
      // Try "300$" format (dollar sign after number)
      budgetMatch = originalText.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)\s*\$/);
      if (budgetMatch && budgetMatch[1] !== extracted.zipcode) {
        const validation = isValidBudget(budgetMatch[1]);
        if (validation.valid) {
          extracted.budget = '$' + budgetMatch[1].replace(/,/g, '');
        }
      }
    }
    
    // Try "X dollars" format
    if (!extracted.budget) {
      budgetMatch = originalText.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)\s*dollars?/i);
      if (budgetMatch && budgetMatch[1] !== extracted.zipcode) {
        const validation = isValidBudget(budgetMatch[1]);
        if (validation.valid) {
          extracted.budget = '$' + budgetMatch[1].replace(/,/g, '');
        }
      }
    }
    
    // Look for budget with context words
    if (!extracted.budget) {
      budgetMatch = originalText.match(
        /(?:budget|cost|price|maximum|max|around|spend)\s+(?:is|of|around)?\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i
      );
      if (budgetMatch && budgetMatch[1] !== extracted.zipcode) {
        const validation = isValidBudget(budgetMatch[1]);
        if (validation.valid) {
          extracted.budget = budgetMatch[1].startsWith('$') ? budgetMatch[1] : '$' + budgetMatch[1].replace(/,/g, '');
        }
      }
    }

    // 4. Location extraction
    const locationMatch = newMessage.match(
      /\b(?:in|at|near|around|located in|area of|city)\s+([A-Z][a-zA-Z\s]+?)(?:\s+\d{5}|$|[,.])/i
    );
    if (locationMatch) {
      extracted.location = locationMatch[1].trim();
    }

    return extracted;
  };

  // Helper: Extract all data from entire message history
  const extractDataFromAllMessages = (msgs: AiChatMessage[]): CollectedData => {
    const allData: CollectedData = {
      service: null,
      budget: null,
      zipcode: null,
      location: null,
      requirements: null,
    };

    // Only process user messages (senderType === 'user')
    msgs.forEach((msg, idx) => {
      if (msg.senderType === 'user') {
        const extracted = extractDataFromMessages(msg.message);
        
        // Check if this message is a service selection (exact match with service names)
        // Service should only be set if user explicitly selected it via buttons or exact name match
        const exactServiceMatch = services.find(s => s.name.toLowerCase() === msg.message.toLowerCase().trim());
        if (exactServiceMatch && !allData.service) {
          allData.service = exactServiceMatch.name;
        }
        
        // Update with any newly extracted data (only fill empty fields)
        // Note: extractDataFromMessages no longer extracts service automatically
        if (extracted.budget && !allData.budget) allData.budget = extracted.budget;
        if (extracted.zipcode && !allData.zipcode) allData.zipcode = extracted.zipcode;
        if (extracted.location && !allData.location) allData.location = extracted.location;

        // Smart requirements detection with question filtering
        if (!allData.requirements) {
          const msgLower = msg.message.toLowerCase();
          const msgLength = msg.message.length;
          const msgText = sanitizeInput(msg.message);

          // Skip if this is a question (questions are not requirements)
          if (isQuestion(msgText)) {
            return; // Skip this message for requirements
          }

          // Check if user explicitly answered "no requirements"
          if (msgLower.includes('no requirement') || msgLower.includes('no preference') || msgLower.includes('no special') || msgLower.includes('nothing specific')) {
            allData.requirements = 'No special requirements';
          }
          // If message is short and simple (just a single value), it's likely not a requirement
          else if (
            msgText.match(/^\d{5}(?:-\d{4})?$/) || // Just a zipcode
            msgText.match(/^\$?\d+[,\d]*\.?\d*\$?$/) || // Just a budget number
            msgText.match(/^\d+\s*dollars?$/i) || // "100 dollars"
            services.some((s) => msgText.toLowerCase().trim() === s.name.toLowerCase()) // Just a service name
          ) {
            return; // Skip - this is a simple value, not a requirement
          }
          // For comprehensive messages, extract only the actual requirement part
          else if (msgLength > 20 && (extracted.zipcode || extracted.budget || msgLower.includes('clean') || msgLower.includes('service'))) {
            // This is a comprehensive message - extract just the requirement part
            // Look for phrases like "all I want", "I need", "requirement", etc.
            const requirementPatterns = [
              /(?:all i want is|what i want is|i need|i want|requirement.*is|looking for)\s*(?:is\s+)?(?:to\s+)?(.+?)(?:\s+(?:my area|area is|zipcode|budget|and my)|\s*$)/i,
              /(?:specifically|i'd like to|need to|want to)\s+(.+?)(?:\s+(?:my area|area is|zipcode|budget|in|and)|\s*$)/i,
            ];
            
            let requirementText = null;
            for (const pattern of requirementPatterns) {
              const match = msgText.match(pattern);
              if (match && match[1]) {
                requirementText = match[1].trim();
                // Remove any trailing budget/zipcode references
                requirementText = requirementText.replace(/\s*(?:area|zipcode|budget|is).*$/i, '').trim();
                break;
              }
            }
            
            if (requirementText && requirementText.length > 5) {
              allData.requirements = requirementText;
            } else {
              // Fallback: use the full message if we can't extract specific requirement
              allData.requirements = msgText;
            }
          }
          // Message is multi-word but doesn't contain other extractable data
          else if (msgLength > 5 && msgText.trim().split(/\s+/).length > 1) {
            allData.requirements = msgText;
          }
        }
      }
    });

    return allData;
  };

  // Helper: Check if user is asking about available services
  const isAskingAboutServices = (text: string): boolean => {
    const keywords = [
      'what services',
      'what do you offer',
      'what can you',
      'available services',
      'do you provide',
      'types of services',
    ];
    return keywords.some((kw) => text.toLowerCase().includes(kw));
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showRecommendations]);

  // Auto-extract data from all messages whenever messages change using AI
  // Only extract after AI responds (not after every user message)
  useEffect(() => {
    if (messages.length === 0 || !session || showConfirmation || editMode || showChatHistory) {
      return; // Don't extract when in edit mode, confirmation dialog, or viewing history
    }

    // Check if there are any user messages (don't extract on just the AI greeting)
    const hasUserMessages = messages.some(m => m.senderType === 'user');
    if (!hasUserMessages) {
      previousMessageCount.current = messages.length;
      return; // Don't extract if no user has sent a message yet
    }

    // Only extract if message count increased by 1 or 2 (user + AI response)
    // This prevents extraction when loading historical sessions (bulk message load)
    const currentCount = messages.length;
    const previousCount = previousMessageCount.current;
    const messageCountDiff = currentCount - previousCount;
    
    if (messageCountDiff > 2 || messageCountDiff <= 0) {
      // Bulk load (historical session) or no change - don't extract
      previousMessageCount.current = currentCount;
      return;
    }

    // Only extract if the last message is from assistant (AI just responded)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.senderType !== 'assistant') {
      previousMessageCount.current = currentCount;
      return;
    }

    // Call backend AI extraction API
    const extractWithAI = async () => {
      try {
        console.log('🔍 Calling AI extraction API...');
        const extracted = await aiChatApi.extractData(session.sessionId);
        console.log('✅ AI Extraction result:', extracted);
        
        // Check if AI extraction returned all nulls (API failed or no data found)
        const hasAnyData = extracted.service || extracted.zipcode || extracted.budget || extracted.requirements;
        
        if (!hasAnyData) {
          console.log('⚠️ Backend AI returned all nulls, falling back to client-side regex extraction...');
          
          // Fallback: Use client-side regex extraction on the last user message
          const lastUserMessage = messages.filter(m => m.senderType === 'user').pop();
          if (lastUserMessage) {
            const clientExtracted = extractDataFromMessages(lastUserMessage.message);
            console.log('📋 Client-side fallback extraction found:', clientExtracted);
            
            // Update with client-side extracted data
            const manuallyEdited = manuallyEditedFields.current;
            setCollectedData(prev => ({
              // Service and zipcode - only set once (don't overwrite)
              service: (clientExtracted.service && !prev.service && !manuallyEdited.has('service')) 
                ? clientExtracted.service 
                : prev.service,
              zipcode: (clientExtracted.zipcode && !prev.zipcode && !manuallyEdited.has('zipcode')) 
                ? clientExtracted.zipcode 
                : prev.zipcode,
              // Budget - always update if new value extracted (unless manually edited)
              budget: (clientExtracted.budget && !manuallyEdited.has('budget')) 
                ? clientExtracted.budget 
                : prev.budget,
              location: prev.location,
              // Requirements - always update if new value extracted (unless manually edited)
              requirements: (clientExtracted.requirements && !manuallyEdited.has('requirements')) 
                ? clientExtracted.requirements 
                : prev.requirements,
            }));
          }
        } else {
          // AI extraction succeeded, use AI results
          console.log('✅ Using backend AI extraction results');
          const manuallyEdited = manuallyEditedFields.current;
          
          setCollectedData(prev => ({
            // Service and zipcode - only set once (don't overwrite)
            service: (extracted.service && !prev.service && !manuallyEdited.has('service')) 
              ? extracted.service 
              : prev.service,
            zipcode: (extracted.zipcode && !prev.zipcode && !manuallyEdited.has('zipcode')) 
              ? extracted.zipcode 
              : prev.zipcode,
            // Budget - always update if new value extracted (unless manually edited)
            budget: (extracted.budget && !manuallyEdited.has('budget')) 
              ? extracted.budget 
              : prev.budget,
            location: prev.location,
            // Requirements - always update if new value extracted (unless manually edited)
            // This allows refining requirements as conversation progresses
            requirements: (extracted.requirements && !manuallyEdited.has('requirements')) 
              ? extracted.requirements 
              : prev.requirements,
          }));
          
          if (manuallyEdited.size > 0) {
            console.log('🔒 Protected fields (manually edited):', Array.from(manuallyEdited));
          }
        }
      } catch (error) {
        console.error('❌ Backend AI extraction failed with error:', error);
        
        // Fallback: Use client-side regex extraction on error
        console.log('⚠️ Falling back to client-side regex extraction due to error...');
        const lastUserMessage = messages.filter(m => m.senderType === 'user').pop();
        if (lastUserMessage) {
          const clientExtracted = extractDataFromMessages(lastUserMessage.message);
          console.log('📋 Client-side fallback extraction found:', clientExtracted);
          
          const manuallyEdited = manuallyEditedFields.current;
          setCollectedData(prev => ({
            // Service and zipcode - only set once (don't overwrite)
            service: (clientExtracted.service && !prev.service && !manuallyEdited.has('service')) 
              ? clientExtracted.service 
              : prev.service,
            zipcode: (clientExtracted.zipcode && !prev.zipcode && !manuallyEdited.has('zipcode')) 
              ? clientExtracted.zipcode 
              : prev.zipcode,
            // Budget - always update if new value extracted (unless manually edited)
            budget: (clientExtracted.budget && !manuallyEdited.has('budget')) 
              ? clientExtracted.budget 
              : prev.budget,
            location: prev.location,
            // Requirements - always update if new value extracted (unless manually edited)
            requirements: (clientExtracted.requirements && !manuallyEdited.has('requirements')) 
              ? clientExtracted.requirements 
              : prev.requirements,
          }));
        }
      }
    };

    // Update the previous count
    previousMessageCount.current = currentCount;
    
    // Debounce AI calls - only call after AI response settles
    const timeoutId = setTimeout(extractWithAI, 300);
    return () => clearTimeout(timeoutId);
  }, [messages, session, showConfirmation, editMode, showChatHistory]);

  const loadActiveSession = async () => {
    try {
      setIsLoading(true);
      const activeSession = await aiChatApi.getActiveSession();
      
      if (activeSession) {
        // Check session expiration (24 hours)
        const sessionAge = Date.now() - new Date(activeSession.createdAt).getTime();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        
        if (sessionAge > TWENTY_FOUR_HOURS) {
          // Session expired, start new one
          console.log('Session expired, starting new one');
          await startNewSession();
          return;
        }
        
        setHasActiveSession(true);
        setShowSessionPrompt(true);
      } else {
        // No active session in database - clear any stale sessionStorage and start fresh
        sessionStorage.removeItem('ai_chat_session_id');
        sessionStorage.removeItem('ai_chat_active');
        sessionStorage.removeItem('ai_chat_show_recommendations');
        sessionStorage.removeItem('ai_chat_summary');
        sessionStorage.removeItem('ai_chat_providers');
        setHasActiveSession(false);
        setShowSessionPrompt(true);
      }
    } catch (error) {
      console.error('Failed to load active session:', error);
      // On error, also clear stale sessionStorage
      sessionStorage.removeItem('ai_chat_session_id');
      sessionStorage.removeItem('ai_chat_active');
      sessionStorage.removeItem('ai_chat_show_recommendations');
      sessionStorage.removeItem('ai_chat_summary');
      sessionStorage.removeItem('ai_chat_providers');
      setHasActiveSession(false);
      setShowSessionPrompt(true);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = async () => {
    try {
      setIsLoading(true);
      const newSession = await aiChatApi.createSession();
      setSession(newSession);
      setMessages([]);
      setShowRecommendations(false);
      setShowSessionPrompt(false);
      setHasActiveSession(false);
      setShowServiceSelection(false); // Reset service selection state
      setServiceSearchFilter(''); // Reset search filter
      setCollectedData({
        service: null,
        budget: null,
        zipcode: null,
        location: null,
        requirements: null,
      });
      setFirstMessageShown(false);
      setSummary(null);

      // Add random initial message from AI
      const randomMessage = INITIAL_MESSAGES[Math.floor(Math.random() * INITIAL_MESSAGES.length)];
      const aiMessage: AiChatMessage = {
        id: `ai-${Date.now()}`,
        senderType: 'assistant',
        message: randomMessage,
        createdAt: new Date().toISOString(),
      };
      setMessages([aiMessage]);
      setFirstMessageShown(true);
      // Don't show service selection by default - only when user asks
    } catch (error) {
      console.error('Failed to create session:', error);
      showError('Failed to start new session. Please try again.', 'Session Error');
    } finally {
      setIsLoading(false);
    }
  };

  const continueExistingSession = async () => {
    try {
      setIsLoading(true);
      const activeSession = await aiChatApi.getActiveSession();
      if (activeSession) {
        setSession(activeSession);
        setMessages(activeSession.messages || []);
        setShowSessionPrompt(false);
        setShowServiceSelection(false); // Don't show selection for continued sessions
        
        // Extract data using backend AI for accurate service detection
        try {
          const aiExtracted = await aiChatApi.extractData(activeSession.sessionId);
          console.log('🔍 AI extraction on session load:', aiExtracted);
          setCollectedData({
            service: aiExtracted.service || null,
            zipcode: aiExtracted.zipcode || null,
            budget: aiExtracted.budget || null,
            location: null,
            requirements: aiExtracted.requirements || null,
          });
        } catch (extractError) {
          console.warn('AI extraction failed on session load, using client-side fallback');
          const extracted = extractDataFromAllMessages(activeSession.messages || []);
          setCollectedData(extracted);
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      showError('Failed to load session. Please try again.', 'Session Error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStoredSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      // Get the specific session by ID
      const sessionData = await aiChatApi.getSessionById(sessionId);
      if (sessionData) {
        setSession(sessionData);
        setMessages(sessionData.messages || []);
        setShowServiceSelection(false); // Don't show selection for restored sessions
        
        // Check if we should restore recommendations view
        const shouldShowRecommendations = sessionStorage.getItem('ai_chat_show_recommendations') === 'true';
        const storedSummary = sessionStorage.getItem('ai_chat_summary');
        const storedProviders = sessionStorage.getItem('ai_chat_providers');
        
        if (shouldShowRecommendations && storedSummary && storedProviders) {
          // Restore recommendations view
          setShowRecommendations(true);
          setSummary(storedSummary);
          setRecommendedProviders(JSON.parse(storedProviders));
          // Clear the stored data
          sessionStorage.removeItem('ai_chat_show_recommendations');
          sessionStorage.removeItem('ai_chat_summary');
          sessionStorage.removeItem('ai_chat_providers');
        } else {
          setShowRecommendations(false); // Show chat by default
        }
        
        // Extract data using backend AI for accurate service detection
        try {
          const aiExtracted = await aiChatApi.extractData(sessionData.sessionId);
          console.log('🔍 AI extraction on session restore:', aiExtracted);
          setCollectedData({
            service: aiExtracted.service || null,
            zipcode: aiExtracted.zipcode || null,
            budget: aiExtracted.budget || null,
            location: null,
            requirements: aiExtracted.requirements || null,
          });
        } catch (extractError) {
          console.warn('AI extraction failed on session restore, using client-side fallback');
          const extracted = extractDataFromAllMessages(sessionData.messages || []);
          setCollectedData(extracted);
        }
      } else {
        // Session not found in database - clear sessionStorage and start fresh
        console.log('Session not found in database, starting new session');
        sessionStorage.removeItem('ai_chat_session_id');
        sessionStorage.removeItem('ai_chat_active');
        sessionStorage.removeItem('ai_chat_show_recommendations');
        sessionStorage.removeItem('ai_chat_summary');
        sessionStorage.removeItem('ai_chat_providers');
        await startNewSession();
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      // Clear stale sessionStorage and fall back to creating a new session
      sessionStorage.removeItem('ai_chat_session_id');
      sessionStorage.removeItem('ai_chat_active');
      sessionStorage.removeItem('ai_chat_show_recommendations');
      sessionStorage.removeItem('ai_chat_summary');
      sessionStorage.removeItem('ai_chat_providers');
      startNewSession();
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const history = await aiChatApi.getSessionHistory();
      setChatHistory(history);
      setShowChatHistory(true);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      showError('Failed to load chat history. Please try again.', 'History Error');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadHistoricalSession = async (historicalSession: AiChatSession) => {
    try {
      setIsLoading(true);
      setShowChatHistory(false);
      
      // Load the full session data with messages
      const sessionData = await aiChatApi.getSessionById(historicalSession.sessionId);
      
      if (sessionData) {
        console.log(`📜 Loading historical session: ${sessionData.sessionId}`);
        console.log(`   Total messages in session: ${sessionData.messages?.length || 0}`);
        console.log(`   Session has summary: ${!!sessionData.summary}`);
        console.log(`   Session is active: ${sessionData.isActive}`);
        
        setSession(sessionData);
        const msgs = sessionData.messages || [];
        
        // Update message count before setting messages to prevent auto-extraction
        previousMessageCount.current = msgs.length;
        
        // If no messages, add a welcome message
        if (msgs.length === 0) {
          const welcomeMsg: AiChatMessage = {
            id: `ai-${Date.now()}`,
            senderType: 'assistant',
            message: 'Welcome back! How can I help you today?',
            createdAt: new Date().toISOString(),
          };
          setMessages([welcomeMsg]);
          previousMessageCount.current = 1;
        } else {
          console.log(`   Setting ${msgs.length} messages to display`);
          setMessages(msgs);
        }
        
        setShowRecommendations(false);
        setShowConfirmation(false);
        setShowServiceSelection(false);
        setShowSessionPrompt(false);
        
        // Extract data using backend AI for accurate service detection
        try {
          const aiExtracted = await aiChatApi.extractData(sessionData.sessionId);
          console.log('🔍 AI extraction on historical session load:', aiExtracted);
          setCollectedData({
            service: aiExtracted.service || null,
            zipcode: aiExtracted.zipcode || null,
            budget: aiExtracted.budget || null,
            location: null,
            requirements: aiExtracted.requirements || null,
          });
        } catch (extractError) {
          console.warn('AI extraction failed on historical session load, using client-side fallback');
          const extracted = extractDataFromAllMessages(msgs);
          setCollectedData(extracted);
        }
        
        // If there's a summary, set it
        if (sessionData.summary) {
          setSummary(sessionData.summary);
        }
      }
    } catch (error) {
      console.error('Failed to load historical session:', error);
      showError('Failed to load session. Please try again.', 'Session Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    if (!session || isSending) return;
    
    setIsSending(true);

    // Sanitize the suggested question
    const sanitizedText = sanitizeInput(question);

    // Add user message optimistically
    const userMessage: AiChatMessage = {
      id: `temp-${Date.now()}`,
      senderType: 'user',
      message: sanitizedText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await aiChatApi.sendMessage(session.sessionId, question);

      // Replace temp message with real one and add AI response
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== userMessage.id);
        return [...filtered, response.userMessage, response.aiMessage];
      });
      setMessageCount(c => c + 2);
    } catch (error) {
      console.error('Failed to send suggested question:', error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      showError('Failed to send message. Please try again.', 'Message Error');
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !session || isSending) return;

    // Message limit check (pagination)
    if (messageCount >= MAX_MESSAGES) {
      showWarning('Message limit reached. Please start a new conversation.', 'Limit Reached');
      return;
    }

    // Sanitize input
    const sanitizedText = sanitizeInput(text);

    // REMOVED: Blocking text input during service selection
    // Users should be able to type their request even when service selector is shown
    // The AI can parse natural language better than forcing button clicks

    setIsSending(true);
    setInput('');

    // Clear edit mode if user is typing normally (not in confirmation dialog)
    // Edit mode should only be active when explicitly clicked from confirmation dialog
    if (editMode && !showConfirmation) {
      setEditMode(null);
    }

    // If in edit mode, only update the specific field being edited
    if (editMode) {
      const updateData: Partial<CollectedData> = {};
      
      if (editMode === 'zipcode') {
        // Validate zipcode
        if (!isValidZipcode(sanitizedText)) {
          setIsSending(false);
          showWarning('Invalid zipcode. Please enter a valid 5-digit US zipcode (e.g., 75001, 90210).\n\nZipcode must be exactly 5 digits between 00501 and 99950.', 'Invalid Zipcode');
          setInput(text);
          return;
        }
        updateData.zipcode = sanitizedText;
      } else if (editMode === 'budget') {
        // Validate budget with real provider price data
        setIsSending(true); // Show loading during async validation
        const validation = await validateBudgetAsync(
          sanitizedText,
          collectedData.service,
          aiChatApi.getServicePriceRange
        );
        if (!validation.valid) {
          setIsSending(false);
          showWarning(validation.error || 'Invalid budget', 'Invalid Budget');
          setInput(text);
          return;
        }
        updateData.budget = sanitizedText;
      } else if (editMode === 'requirements') {
        updateData.requirements = sanitizedText;
      }
      
      // Update the specific field
      setCollectedData((prev) => ({
        ...prev,
        ...updateData,
      }));
      
      // Mark this field as manually edited to prevent AI from overwriting it
      if (editMode) {
        manuallyEditedFields.current.add(editMode);
        console.log(`🔒 Locked field from AI extraction: ${editMode}`);
      }
      
      // Save edit to database for audit trail
      // This creates a complete history: original message → edit → summary
      if (!showConfirmation && session) {
        // Optimistic UI update - show user message immediately
        const tempUserMessage: AiChatMessage = {
          id: `temp-user-${Date.now()}`,
          senderType: 'user',
          message: sanitizedText,
          createdAt: new Date().toISOString(),
        };
        
        setMessages((prev) => [...prev, tempUserMessage]);
        setMessageCount(c => c + 1);
        
        try {
          // Send edit message to database
          const response = await aiChatApi.sendMessage(session.sessionId, sanitizedText);
          
          // Replace temp user message with real one and add AI response
          const newUserMessage: AiChatMessage = {
            id: response.userMessage?.id || `user-${Date.now()}`,
            senderType: 'user',
            message: sanitizedText,
            createdAt: response.userMessage?.createdAt || new Date().toISOString(),
          };
          
          const newAiMessage: AiChatMessage = {
            id: response.aiMessage?.id || `ai-${Date.now()}`,
            senderType: 'assistant',
            message: response.aiMessage?.message || `Got it! I've updated your ${editMode}.`,
            createdAt: response.aiMessage?.createdAt || new Date().toISOString(),
          };
          
          setMessages((prev) => {
            // Replace temp message with real messages
            const filtered = prev.filter(m => m.id !== tempUserMessage.id);
            return [...filtered, newUserMessage, newAiMessage];
          });
          setMessageCount(c => c + 1); // +1 more for AI message (user already counted)
        } catch (error) {
          console.error('Failed to save edit message:', error);
          // Keep the temp user message, add AI response locally
          const aiMessage: AiChatMessage = {
            id: `ai-${Date.now()}`,
            senderType: 'assistant',
            message: `Got it! I've updated your ${editMode}.`,
            createdAt: new Date().toISOString(),
          };
          
          setMessages((prev) => [...prev, aiMessage]);
          setMessageCount(c => c + 1);
        }
      }
      
      // Clear edit mode (confirmation dialog will show updated value)
      setEditMode(null);
      setIsSending(false);
      return;
    }

    // Backend AI extraction will happen via useEffect after message is sent
    // Client-side regex extraction is used as fallback if AI returns null

    // REMOVED: Vague request detection that prevented first message from being saved
    // This was causing messages like "I need house cleaning" to never reach the backend
    // Let the AI handle all messages instead of intercepting them

    // REMOVED: Service question interception - let OpenAI handle all questions naturally
    // The AI is smart enough to respond appropriately to service questions

    // Add user message optimistically
    const userMessage: AiChatMessage = {
      id: `temp-${Date.now()}`,
      senderType: 'user',
      message: sanitizedText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Log what data we already have
    console.log('📊 Current collected data:', collectedData);

    try {
      const response = await aiChatApi.sendMessage(session.sessionId, text);

      // Replace temp message with real one and add AI response
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== userMessage.id);
        return [...filtered, response.userMessage, response.aiMessage];
      });
      setMessageCount(c => c + 2);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      showError('Failed to send message. Please try again.', 'Message Error');
    } finally {
      setIsSending(false);
    }
  };

  const handleFinishAndGetRecommendations = async () => {
    if (!session) return;

    // Validate required data first (Service, Budget, Zipcode are mandatory; Requirements is optional)
    if (!isRequiredDataComplete()) {
      const missing = [];
      if (!collectedData.service) missing.push('Service');
      if (!collectedData.budget) missing.push('Budget');
      if (!collectedData.zipcode) missing.push('Zipcode');

      showWarning(`Please provide the following information:\n\n${missing.join('\n')}`, 'Missing Information');
      return;
    }

    // Show confirmation dialog - user needs to click "Confirm" in the dialog
    setShowConfirmation(true);
  };

  const handleConfirmAndProceed = async () => {
    if (!session) return;

    try {
      setIsGeneratingSummary(true);

      // Generate summary first - use current collected data (includes edits)
      const summaryResult = await aiChatApi.generateSummary(session.sessionId, {
        service: collectedData.service,
        zipcode: collectedData.zipcode,
        budget: collectedData.budget,
        requirements: collectedData.requirements,
      });
      console.log('Summary generated:', summaryResult);
      setSummary(summaryResult.summary);

      // Use collected data for recommendations
      const service = collectedData.service || 'Plumbing';
      const zipcode = collectedData.zipcode || '75001';

      console.log('Getting recommendations for:', service, zipcode);

      // Get recommendations
      try {
        const recommendations = await aiChatApi.getRecommendedProviders(service, zipcode);
        console.log('Recommendations response:', recommendations);

        if (recommendations.providers && recommendations.providers.length > 0) {
          setRecommendedProviders(recommendations.providers);
          setShowRecommendations(true);
        } else {
          showInfo(
            `No providers found for ${service} in ${zipcode}. Please try a different location or service.`,
            'No Providers Found'
          );
        }
      } catch (error) {
        console.error('Failed to get recommendations:', error);
        showError('Failed to get recommendations. Please try again.', 'Recommendation Error');
      }
    } catch (error) {
      console.error('Failed during finish and get recommendations:', error);
      showError('Failed to generate summary and get recommendations. Please try again.', 'Processing Error');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleServiceSelection = async (serviceName: string) => {
    if (!session) return;

    setShowServiceSelection(false);
    setServiceSearchFilter(''); // Reset search filter
    setCollectedData((prev) => ({ ...prev, service: serviceName }));

    // Mark service as manually selected to prevent AI from overwriting it
    manuallyEditedFields.current.add('service');
    console.log(`🔒 Locked field from AI extraction: service (${serviceName})`);

    // If in edit mode, skip AI and just update
    if (editMode === 'service') {
      // Save to database for audit trail
      if (!showConfirmation && session) {
        // Optimistic UI update - show user message immediately
        const tempUserMessage: AiChatMessage = {
          id: `temp-user-${Date.now()}`,
          senderType: 'user',
          message: serviceName,
          createdAt: new Date().toISOString(),
        };
        
        setMessages((prev) => [...prev, tempUserMessage]);
        setMessageCount(c => c + 1);
        
        try {
          // Send edit message to database
          const response = await aiChatApi.sendMessage(session.sessionId, serviceName);
          
          // Replace temp user message with real one and add AI response
          const newUserMessage: AiChatMessage = {
            id: response.userMessage?.id || `user-${Date.now()}`,
            senderType: 'user',
            message: serviceName,
            createdAt: response.userMessage?.createdAt || new Date().toISOString(),
          };
          
          const newAiMessage: AiChatMessage = {
            id: response.aiMessage?.id || `ai-${Date.now()}`,
            senderType: 'assistant',
            message: response.aiMessage?.message || `Got it! I've updated your service to "${serviceName}".`,
            createdAt: response.aiMessage?.createdAt || new Date().toISOString(),
          };
          
          setMessages((prev) => {
            // Replace temp message with real messages
            const filtered = prev.filter(m => m.id !== tempUserMessage.id);
            return [...filtered, newUserMessage, newAiMessage];
          });
          setMessageCount(c => c + 1); // +1 more for AI message
        } catch (error) {
          console.error('Failed to save service edit:', error);
          // Keep the temp user message, add AI response locally
          const aiMessage: AiChatMessage = {
            id: `ai-${Date.now()}`,
            senderType: 'assistant',
            message: `Got it! I've updated your service to "${serviceName}".`,
            createdAt: new Date().toISOString(),
          };
          
          setMessages((prev) => [...prev, aiMessage]);
          setMessageCount(c => c + 1);
        }
      }
      
      setEditMode(null);
      return;
    }

    // Normal flow (not editing) - send to AI with context of already collected data
    const userMessage: AiChatMessage = {
      id: `temp-${Date.now()}`,
      senderType: 'user',
      message: serviceName,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Build a context message that includes already-collected data
    let messageToSend = serviceName;
    
    // Check what data we already have from previous extraction
    const hasZipcode = !!collectedData.zipcode;
    const hasBudget = !!collectedData.budget;
    const hasRequirements = !!collectedData.requirements;
    
    if (hasZipcode || hasBudget || hasRequirements) {
      // Add context so AI knows we already have some data
      messageToSend += ' (';
      const parts = [];
      if (hasZipcode) parts.push(`zipcode: ${collectedData.zipcode}`);
      if (hasBudget) parts.push(`budget: ${collectedData.budget}`);
      if (hasRequirements) parts.push(`requirements: ${collectedData.requirements}`);
      messageToSend += parts.join(', ') + ')';
    }

    try {
      // Send to AI with context
      const response = await aiChatApi.sendMessage(session.sessionId, messageToSend);
      
      // Handle the response structure properly
      const aiMessage: AiChatMessage = {
        id: response.aiMessage?.id || `ai-${Date.now()}`,
        senderType: 'assistant',
        message: response.aiMessage?.message || 'Message received.',
        createdAt: response.aiMessage?.createdAt || new Date().toISOString(),
      };
      
      // Replace temp message with real user message and add AI response
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== userMessage.id);
        return [...filtered, response.userMessage || userMessage, aiMessage];
      });
      setMessageCount(c => c + 1);
    } catch (error) {
      console.error('Failed to send service selection:', error);
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      showError('Failed to send message. Please try again.', 'Message Error');
    }
  };

  const handleEditData = (field: 'service' | 'zipcode' | 'budget' | 'requirements') => {
    setEditMode(field);
    setShowConfirmation(false);
    
    // Don't clear the field - keep the current value so user can see what they're editing
    // The new value will overwrite it when they submit
    
    if (field === 'service') {
      setShowServiceSelection(true);
    } else {
      // For budget, zipcode, requirements - ensure input is enabled
      setShowServiceSelection(false);
    }
  };

  const handleProviderClick = async (provider: RecommendedProvider) => {
    if (!session) return;

    try {
      // Generate slug for provider
      const slug = generateProviderSlug(
        provider.businessName || provider.ownerName,
        provider.id
      );

      // Store session context and view state in sessionStorage to preserve position when returning
      sessionStorage.setItem('ai_chat_session_id', session.sessionId);
      sessionStorage.setItem('ai_chat_active', 'true');
      sessionStorage.setItem('ai_chat_show_recommendations', 'true');
      sessionStorage.setItem('ai_chat_summary', summary || '');
      sessionStorage.setItem('ai_chat_providers', JSON.stringify(recommendedProviders));
      
      // Store uploaded images for passing to chat creation
      if (uploadedImages.length > 0) {
        sessionStorage.setItem('ai_chat_uploaded_images', JSON.stringify(uploadedImages));
      }

      // Navigate to provider page with AI flow parameters
      router.push(`/${slug}?from_ai=true&session_id=${session.sessionId}`);
      // Don't close chat - keep it open for return
    } catch (error) {
      console.error('Failed to navigate to provider:', error);
      showError('Failed to open provider page. Please try again.', 'Navigation Error');
    }
  };

  // Helper: Strip markdown formatting from text (** and __)
  const stripMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '$1')      // Remove **bold**
      .replace(/__(.+?)__/g, '$1')           // Remove __bold__
      .replace(/\*(.+?)\*/g, '$1')           // Remove *italic*
      .replace(/_(.+?)_/g, '$1');            // Remove _italic_
  };

  // Helper: Format summary for display with bold headings
  const formatSummaryForDisplay = (rawSummary: string) => {
    // Expected format: "Service: {service} | Location: {zipcode} | Budget: {budget} | Requirements: {details}"
    // Or multi-line format:
    // Service: ...
    // Location: ...
    // Budget: ...
    // Requirements: ...
    
    // Remove markdown formatting first
    const cleanSummary = stripMarkdown(rawSummary);
    const lines = cleanSummary.split(/[|\n]/).map((item) => item.trim()).filter(item => item);

    return (
      <div className="space-y-2 text-sm">
        {lines.map((line, idx) => {
          const [key, value] = line.split(':').map((s) => s.trim());
          if (!key || !value) return null;
          return (
            <div key={idx}>
              <span className="font-bold text-gray-900">{stripMarkdown(key)}:</span>
              <span className="text-gray-700 ml-2">{stripMarkdown(value)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border border-white border-opacity-20">
        {/* Header */}
        <div className="bg-navy-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <img src="/chatbot.png" alt="AI" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <div className="font-semibold text-lg">SPS AI Sales Assistant</div>
              <p className="text-xs text-navy-200">Ask about services, availability or pricing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session && (
              <>
                <button
                  onClick={loadChatHistory}
                  disabled={isLoadingHistory}
                  className="text-xs bg-white text-navy-600 px-3 py-1 rounded hover:bg-gray-100 transition-colors font-semibold disabled:opacity-50"
                  title="View previous conversations"
                >
                  {isLoadingHistory ? 'Loading...' : 'Previous Chats'}
                </button>
                <button
                  onClick={startNewSession}
                  className="text-xs bg-white text-navy-600 px-3 py-1 rounded hover:bg-gray-100 transition-colors font-semibold"
                  title="Start a new conversation"
                >
                  New Chat
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-white hover:bg-navy-700 p-2 rounded transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading && !session ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          ) : showSessionPrompt && hasActiveSession ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 max-w-md w-full border border-blue-200 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">You have an ongoing session</h3>
                <p className="text-gray-700 mb-6">Would you like to continue your previous conversation or start a new one?</p>
                <div className="flex gap-3">
                  <button
                    onClick={continueExistingSession}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                  >
                    Continue
                  </button>
                  <button
                    onClick={startNewSession}
                    className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-blue-200"
                  >
                    New Session
                  </button>
                </div>
              </div>
            </div>
          ) : !session ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <button
                  onClick={startNewSession}
                  className="bg-navy-600 text-white px-6 py-3 rounded-lg hover:bg-navy-700 transition-colors font-semibold"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              {!showRecommendations && !showConfirmation && !showChatHistory && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <p className="mb-2">👋 Hi! I'm your AI Sales Assistant.</p>
                      <p>Tell me what service you need, your location, and any other requirements.</p>
                    </div>
                  )}

                  {messages.map((msg, index) => {
                    const isUser = msg.senderType === 'user';
                    // Use a combination of session ID, message index, and creation time for stable unique keys
                    const uniqueKey = session
                      ? `${session.sessionId}-${index}-${msg.id}`
                      : `${index}-${msg.id}`;
                    return (
                      <div key={uniqueKey} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
                          {!isUser && (
                            <div className="text-xs font-semibold text-gray-600 mb-1">AI Assistant</div>
                          )}
                          <div
                            className={`rounded-lg px-4 py-3 ${
                              isUser
                                ? 'bg-green-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{stripMarkdown(msg.message)}</p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Suggested Questions - Show only when there's just the AI greeting (no user messages yet) */}
                  {messages.length > 0 && messages.length <= 2 && !messages.some(m => m.senderType === 'user') && !isSending && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-600 text-center mb-3 font-medium">💡 Not sure what to ask? Try these:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                        {SUGGESTED_QUESTIONS.map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestedQuestion(question)}
                            className="text-left px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-lg transition-all hover:shadow-md text-sm text-gray-700 hover:text-gray-900"
                          >
                            <span className="text-blue-600 mr-2">→</span>
                            {question}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-3">Or type your own question below</p>
                    </div>
                  )}

                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Service Selection Buttons */}
                  {showServiceSelection && !servicesLoading && (
                    <div className="flex justify-center w-full px-2">
                      <div className="w-full max-w-4xl bg-gray-50 border-2 border-navy-200 rounded-xl p-4 shadow-lg">
                        <div className="text-sm font-bold text-navy-700 mb-3 text-center">🔍 Select a Service</div>
                        
                        {/* Search Filter */}
                        <input
                          type="text"
                          value={serviceSearchFilter}
                          onChange={(e) => setServiceSearchFilter(e.target.value)}
                          placeholder="Search services..."
                          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
                        />
                        
                        <div className="max-h-96 overflow-y-auto">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {services.length > 0 ? (
                              services
                                .filter(service => {
                                  const serviceLower = service.name.toLowerCase();
                                  const filterLower = serviceSearchFilter.toLowerCase();
                                  // Match if service contains the filter OR filter contains service keyword
                                  // This ensures "clean" shows "Cleaning", "Window Washing", etc.
                                  return serviceLower.includes(filterLower) || 
                                         (filterLower.includes('clean') && (serviceLower.includes('clean') || serviceLower.includes('wash'))) ||
                                         (filterLower.includes('plumb') && serviceLower.includes('plumb')) ||
                                         (filterLower.includes('electric') && serviceLower.includes('electric')) ||
                                         (filterLower.includes('roof') && serviceLower.includes('roof')) ||
                                         (filterLower.includes('window') && serviceLower.includes('window')) ||
                                         (filterLower.includes('carpet') && serviceLower.includes('carpet')) ||
                                         (filterLower.includes('deck') && serviceLower.includes('deck')) ||
                                         (filterLower.includes('gutter') && serviceLower.includes('gutter')) ||
                                         (filterLower.includes('driveway') && serviceLower.includes('driveway')) ||
                                         (filterLower.includes('garage') && serviceLower.includes('garage')) ||
                                         (filterLower.includes('pest') && serviceLower.includes('pest')) ||
                                         (filterLower.includes('office') && serviceLower.includes('office'));
                                })
                                .map((service) => (
                                  <button
                                    key={service.id}
                                    onClick={() => handleServiceSelection(service.name)}
                                    className="bg-white border-2 border-navy-400 text-navy-700 px-3 py-2.5 rounded-lg hover:bg-navy-600 hover:text-white hover:border-navy-600 transition-all text-xs font-semibold text-center shadow-sm hover:shadow-md active:scale-95"
                                  >
                                    {service.name}
                                  </button>
                                ))
                            ) : (
                              // Fallback services if API fails
                              [
                                'House Cleaning',
                                'Roof Cleaning',
                                'Window Cleaning',
                                'Carpet Cleaning',
                                'Deep Cleaning',
                                'Office Cleaning',
                                'Plumbing',
                                'Electrical',
                              ]
                                .filter(service => 
                                  service.toLowerCase().includes(serviceSearchFilter.toLowerCase())
                                )
                                .map((service) => (
                                  <button
                                    key={service}
                                    onClick={() => handleServiceSelection(service)}
                                    className="bg-white border-2 border-navy-400 text-navy-700 px-3 py-2.5 rounded-lg hover:bg-navy-600 hover:text-white hover:border-navy-600 transition-all text-xs font-semibold text-center shadow-sm hover:shadow-md active:scale-95"
                                  >
                                    {service}
                                  </button>
                                ))
                            )}
                          </div>
                          {services.length > 0 && services.filter(s => s.name.toLowerCase().includes(serviceSearchFilter.toLowerCase())).length === 0 && (
                            <div className="text-center py-8 text-gray-500 text-sm">
                              No services found matching "{serviceSearchFilter}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Confirmation Dialog */}
              {showConfirmation && !showRecommendations && isRequiredDataComplete() && (
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                  <div className="max-w-full mx-auto w-full flex flex-col min-h-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Please Review Your Information</h3>
                    <p className="text-sm text-gray-600 mb-4">Please verify the details below before we find the best providers for you:</p>
                    
                    <div className="space-y-3 mb-4 flex-1">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700">Service</h4>
                            <p className="text-base text-gray-900">{collectedData.service}</p>
                          </div>
                          <button 
                            onClick={() => handleEditData('service')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700">Location</h4>
                            <p className="text-base text-gray-900">{collectedData.zipcode}</p>
                          </div>
                          <button 
                            onClick={() => handleEditData('zipcode')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700">Budget</h4>
                            <p className="text-base text-gray-900">{collectedData.budget}</p>
                          </div>
                          <button 
                            onClick={() => handleEditData('budget')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-700">Requirements <span className="text-blue-600 text-xs font-normal">(Optional)</span></h4>
                            <p className="text-base text-gray-900 break-words">{collectedData.requirements || 'No specific requirements'}</p>
                          </div>
                          {collectedData.requirements && (
                            <button 
                              onClick={() => handleEditData('requirements')}
                              className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline ml-4"
                            >
                              Change
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Image Upload Section */}
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-700">
                              📸 Photos <span className="text-purple-600 text-xs font-normal">(Optional)</span>
                            </h4>
                            {uploadedImages.length > 0 ? (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600 mb-2">{uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} uploaded</p>
                                <div className="flex flex-wrap gap-2">
                                  {uploadedImages.map((url, idx) => (
                                    <div key={idx} className="relative group">
                                      <img 
                                        src={url} 
                                        alt={`Upload ${idx + 1}`} 
                                        className="w-16 h-16 object-cover rounded-lg border border-purple-200"
                                      />
                                      <button
                                        onClick={() => handleRemoveUploadedImage(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600 mt-1">Add photos to help providers understand your project</p>
                            )}
                          </div>
                          <button 
                            onClick={() => setShowImageUploadModal(true)}
                            className="text-purple-600 hover:text-purple-800 text-sm font-semibold underline ml-4"
                          >
                            {uploadedImages.length > 0 ? 'Add More' : 'Add Photos'}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => setShowConfirmation(false)}
                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
                      >
                        Go Back
                      </button>
                      <button
                        onClick={handleConfirmAndProceed}
                        disabled={isGeneratingSummary}
                        className="flex-1 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingSummary ? 'Finding Providers...' : 'Confirm & Find Providers'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat History Section */}
              {showChatHistory && (
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                  {/* Go Back Button */}
                  <button
                    onClick={() => setShowChatHistory(false)}
                    className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Go Back
                  </button>

                  <h3 className="text-2xl font-bold text-black mb-4">Previous Chat Sessions</h3>
                  
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <p>No previous chat sessions found.</p>
                      <p className="text-sm mt-2">Start a new conversation to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chatHistory.map((historicalSession) => (
                        <div
                          key={historicalSession.sessionId}
                          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => loadHistoricalSession(historicalSession)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                Session from {new Date(historicalSession.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </h4>
                              {historicalSession.summary && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {historicalSession.summary}
                                </p>
                              )}
                            </div>
                            <div className="ml-4 flex flex-col items-end gap-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                historicalSession.summary
                                  ? 'bg-blue-100 text-blue-700'
                                  : historicalSession.isActive 
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {historicalSession.summary ? 'Completed' : historicalSession.isActive ? 'Active' : 'Closed'}
                              </span>
                              {historicalSession.messageCount !== undefined && (
                                <span className="text-xs text-gray-500">
                                  {historicalSession.messageCount} messages
                                </span>
                              )}
                            </div>
                          </div>
                          <button className="mt-2 text-center bg-navy-600 text-white px-4 py-1 rounded hover:bg-navy-700 transition-colors text-xs font-medium">
                            {historicalSession.summary ? 'View Conversation (Read-Only)' : 'Continue Conversation'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Provider Recommendations with Summary */}
              {showRecommendations && (
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                  {/* Go Back to Chat Button */}
                  <button
                    onClick={() => setShowRecommendations(false)}
                    className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Go Back to Chat Messages
                  </button>

                  {summary && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">Your Requirements Summary</h4>
                      {formatSummaryForDisplay(summary)}
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-black mb-4">Recommended Providers</h3>
                  {recommendedProviders.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <p>No providers found matching your criteria.</p>
                      <p className="text-sm mt-2">We'll notify you when providers become available in your area.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendedProviders.map((provider) => (
                        <div
                          key={provider.id}
                          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleProviderClick(provider)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {provider.businessName || provider.ownerName}
                            </h4>
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-base font-bold text-black">{provider.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{provider.location}</p>
                          {provider.minPrice && provider.maxPrice && (
                            <p className="text-sm text-navy-600 font-semibold">
                              ${provider.minPrice} - ${provider.maxPrice}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {provider.totalJobs} jobs • {provider.experience} years exp.
                          </p>
                          <button className="mt-3 w-full bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700 transition-colors text-sm">
                            View Profile
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Input Area with Requirements Indicator */}
              {!showRecommendations && !showConfirmation && !showChatHistory && (
                <div className="border-t border-gray-200 bg-white">
                  {/* Check if session is closed (has summary) and show read-only message */}
                  {session && summary && !session.isActive ? (
                    <div className="p-4 bg-yellow-50 border-t-2 border-yellow-400 text-center">
                      <p className="text-sm text-yellow-800 font-medium">
                        📋 This conversation has been completed and is now read-only.
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        The summary has been generated. You can view the conversation but cannot send new messages.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Data collection indicator with edit buttons */}
                      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 space-y-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between">
                        <span className={collectedData.service ? 'text-green-600' : 'text-gray-500'}>
                          {collectedData.service ? '✓' : '○'} Service: {collectedData.service || 'Not provided'}
                        </span>
                        {collectedData.service && (
                          <button 
                            onClick={() => handleEditData('service')}
                            className="ml-2 text-blue-600 hover:text-blue-800 underline"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={collectedData.budget ? 'text-green-600' : 'text-gray-500'}>
                          {collectedData.budget ? '✓' : '○'} Budget: {collectedData.budget || 'Not provided'}
                        </span>
                        {collectedData.budget && (
                          <button 
                            onClick={() => handleEditData('budget')}
                            className="ml-2 text-blue-600 hover:text-blue-800 underline"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={collectedData.zipcode ? 'text-green-600' : 'text-gray-500'}>
                          {collectedData.zipcode ? '✓' : '○'} Zipcode: {collectedData.zipcode || 'Not provided'}
                        </span>
                        {collectedData.zipcode && (
                          <button 
                            onClick={() => handleEditData('zipcode')}
                            className="ml-2 text-blue-600 hover:text-blue-800 underline"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={collectedData.requirements ? 'text-green-600' : 'text-gray-500'}>
                          {collectedData.requirements ? '✓' : '○'} Requirements: {collectedData.requirements ? (collectedData.requirements.length > 20 ? collectedData.requirements.substring(0, 20) + '...' : collectedData.requirements) : 'Not provided'}
                        </span>
                        {collectedData.requirements && (
                          <button 
                            onClick={() => handleEditData('requirements')}
                            className="ml-2 text-blue-600 hover:text-blue-800 underline"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder={
                          showServiceSelection && !editMode
                            ? "Please select a service from the options above..."
                            : editMode === 'service'
                            ? "Select a service from the options above..."
                            : editMode === 'zipcode'
                            ? "Enter your zipcode..."
                            : editMode === 'budget'
                            ? "Enter your budget (e.g., 100 or $100)..."
                            : editMode === 'requirements'
                            ? "Enter your requirements..."
                            : "Tell me about what you need..."
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm text-black placeholder-gray-500"
                        disabled={isSending || (showServiceSelection && editMode !== 'budget' && editMode !== 'zipcode' && editMode !== 'requirements')}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={isSending || !input.trim() || (showServiceSelection && editMode !== 'budget' && editMode !== 'zipcode' && editMode !== 'requirements')}
                        className="bg-navy-600 text-white px-6 py-2 rounded-lg hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>
                    <button
                      onClick={handleFinishAndGetRecommendations}
                      disabled={
                        isGeneratingSummary ||
                        messages.length === 0 ||
                        !isRequiredDataComplete()
                      }
                      title={
                        !isRequiredDataComplete()
                          ? 'Please provide all required information: Service, Budget, Zipcode, and Requirements'
                          : 'Click to review and get recommendations'
                      }
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {isGeneratingSummary ? 'Generating Summary...' : 'Finish & Get Recommendations'}
                    </button>
                  </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageUploadModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
         style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
        >
          <div className="bg-white rounded-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">📸 Upload Photos</h3>
                <button
                  onClick={() => {
                    setShowImageUploadModal(false);
                    setSelectedImageFiles([]);
                    setImagePreviews([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Upload up to 5 photos to help providers better understand your project. 
                <span className="text-gray-500"> (Max 5MB per image, JPG/PNG/GIF/WEBP)</span>
              </p>

              {/* Hidden file input */}
              <input
                ref={imageFileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
                onChange={handleImageFileSelect}
                className="hidden"
              />

              {/* Upload Area */}
              <div
                onClick={() => imageFileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = Array.from(e.dataTransfer.files);
                  const imageFiles = files.filter((f) => f.type.startsWith('image/'));
                  if (imageFiles.length > 0) {
                    // Simulate file input change
                    const dt = new DataTransfer();
                    imageFiles.forEach((f) => dt.items.add(f));
                    if (imageFileInputRef.current) {
                      imageFileInputRef.current.files = dt.files;
                      imageFileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                  }
                }}
                className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <div className="text-4xl mb-2">📷</div>
                <p className="text-gray-700 font-medium">Click or drag & drop to add photos</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedImageFiles.length + uploadedImages.length}/{MAX_IMAGES} images selected
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Selected Images:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={preview}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSelectedImage(idx);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Already Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Already Uploaded:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {uploadedImages.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={url}
                          alt={`Uploaded ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg border-2 border-green-400"
                        />
                        <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowImageUploadModal(false);
                    setSelectedImageFiles([]);
                    setImagePreviews([]);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadImages}
                  disabled={selectedImageFiles.length === 0 || isUploadingImages}
                  className="flex-1 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingImages ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    `Upload ${selectedImageFiles.length} Image${selectedImageFiles.length !== 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error/Warning/Info Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlertModal}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
