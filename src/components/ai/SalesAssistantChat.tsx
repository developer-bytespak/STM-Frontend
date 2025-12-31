'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { aiChatApi, AiChatSession, AiChatMessage, RecommendedProvider } from '@/api/ai-chat';
import { homepageApi } from '@/api/homepage';
import { generateProviderSlug } from '@/lib/slug';
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

  // Fetch available services on mount
  useEffect(() => {
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
  const isRequiredDataComplete = (): boolean => {
    return !!(
      collectedData.service &&
      collectedData.budget &&
      collectedData.zipcode &&
      collectedData.requirements
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
    if (messages.length === 0 || !session || showConfirmation || editMode) {
      return; // Don't extract when in edit mode or confirmation dialog
    }

    // Only extract if the last message is from assistant (AI just responded)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.senderType !== 'assistant') {
      return;
    }

    // Call backend AI extraction API
    const extractWithAI = async () => {
      try {
        console.log('🔍 Calling AI extraction API...');
        const extracted = await aiChatApi.extractData(session.sessionId);
        console.log('✅ AI Extraction result:', extracted);
        
        // Only update fields that:
        // 1. Are currently null/empty AND
        // 2. Were NOT manually edited by the user
        const manuallyEdited = manuallyEditedFields.current;
        
        setCollectedData(prev => ({
          service: (extracted.service && !prev.service && !manuallyEdited.has('service')) 
            ? extracted.service 
            : prev.service,
          zipcode: (extracted.zipcode && !prev.zipcode && !manuallyEdited.has('zipcode')) 
            ? extracted.zipcode 
            : prev.zipcode,
          budget: (extracted.budget && !prev.budget && !manuallyEdited.has('budget')) 
            ? extracted.budget 
            : prev.budget,
          location: prev.location,
          requirements: (extracted.requirements && !prev.requirements && !manuallyEdited.has('requirements')) 
            ? extracted.requirements 
            : prev.requirements,
        }));
        
        if (manuallyEdited.size > 0) {
          console.log('🔒 Protected fields (manually edited):', Array.from(manuallyEdited));
        }
      } catch (error) {
        console.error('❌ Failed to extract data with AI:', error);
        // Silently fail - don't disrupt user experience
      }
    };

    // Debounce AI calls - only call after AI response settles
    const timeoutId = setTimeout(extractWithAI, 300);
    return () => clearTimeout(timeoutId);
  }, [messages, session, showConfirmation, editMode]);

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
        setHasActiveSession(false);
        setShowSessionPrompt(false);
      }
    } catch (error) {
      console.error('Failed to load active session:', error);
      setHasActiveSession(false);
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
      alert('Failed to start new session. Please try again.');
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
        // Auto-extract data from existing messages
        const extracted = extractDataFromAllMessages(activeSession.messages || []);
        setCollectedData(extracted);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      alert('Failed to load session. Please try again.');
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
        setShowRecommendations(false); // Show chat, not recommendations
        // Auto-extract data from existing messages
        const extracted = extractDataFromAllMessages(sessionData.messages || []);
        setCollectedData(extracted);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      // Fall back to creating a new session
      startNewSession();
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !session || isSending) return;

    // Message limit check (pagination)
    if (messageCount >= MAX_MESSAGES) {
      alert('Message limit reached. Please start a new conversation.');
      return;
    }

    // Sanitize input
    const sanitizedText = sanitizeInput(text);

    // If service selection is shown, don't allow text input (user must select from buttons)
    if (showServiceSelection && !editMode) {
      alert('Please select a service from the options above.');
      setInput('');
      setIsSending(false);
      return;
    }

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
          alert('Invalid zipcode. Please enter a valid 5-digit US zipcode (e.g., 75001, 90210).\n\nZipcode must be:\n• Exactly 5 digits\n• Between 00501 and 99950');
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
          alert(validation.error || 'Invalid budget');
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
            id: response.message?.id || `user-${Date.now()}`,
            senderType: 'user',
            message: sanitizedText,
            createdAt: response.message?.createdAt || new Date().toISOString(),
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

    // Extract data will happen automatically via useEffect after message is sent
    // No need for manual extraction here - AI handles it

    // Detect vague requests and proactively show service selection
    if (!collectedData.service && isVagueRequest(sanitizedText)) {
      // Clear edit mode since user is starting fresh
      setEditMode(null);
      
      const userMessage: AiChatMessage = {
        id: `temp-${Date.now()}`,
        senderType: 'user',
        message: sanitizedText,
        createdAt: new Date().toISOString(),
      };

      const aiMessage: AiChatMessage = {
        id: `ai-${Date.now()}-vague`,
        senderType: 'assistant',
        message: 'I\'d be happy to help! Let me show you our available services. Please select the one you need:',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, aiMessage]);
      setMessageCount(c => c + 2);
      setShowServiceSelection(true);
      setIsSending(false);
      return;
    }

    // Check if user is asking about services
    if (isAskingAboutServices(sanitizedText)) {
      // Clear edit mode since user is asking about services in normal conversation
      setEditMode(null);
      
      const userMessage: AiChatMessage = {
        id: `temp-${Date.now()}`,
        senderType: 'user',
        message: sanitizedText,
        createdAt: new Date().toISOString(),
      };

      const aiMessage: AiChatMessage = {
        id: `ai-${Date.now()}-services`,
        senderType: 'assistant',
        message: 'Great question! We offer various cleaning and home service options. Please select the service you need from the options below:',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, aiMessage]);
      setMessageCount(c => c + 2);
      setShowServiceSelection(true); // Show service selection buttons
      setIsSending(false);
      return;
    }

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
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleFinishAndGetRecommendations = async () => {
    if (!session) return;

    // Validate required data first
    if (!isRequiredDataComplete()) {
      const missing = [];
      if (!collectedData.service) missing.push('Service');
      if (!collectedData.budget) missing.push('Budget');
      if (!collectedData.zipcode) missing.push('Zipcode');
      if (!collectedData.requirements) missing.push('Requirements');

      alert(`Please provide the following information:\n\n${missing.join('\n')}`);
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
          alert(
            `No providers found for ${service} in ${zipcode}. Please try a different location or service.`
          );
        }
      } catch (error) {
        console.error('Failed to get recommendations:', error);
        alert('Failed to get recommendations. Please try again.');
      }
    } catch (error) {
      console.error('Failed during finish and get recommendations:', error);
      alert('Failed to generate summary and get recommendations. Please try again.');
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
            id: response.message?.id || `user-${Date.now()}`,
            senderType: 'user',
            message: serviceName,
            createdAt: response.message?.createdAt || new Date().toISOString(),
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

    // Normal flow (not editing) - send to AI
    const userMessage: AiChatMessage = {
      id: `temp-${Date.now()}`,
      senderType: 'user',
      message: serviceName,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Send to AI
      const response = await aiChatApi.sendMessage(session.sessionId, serviceName);
      
      // Handle the response structure properly
      const aiMessage: AiChatMessage = {
        id: response.aiMessage?.id || `ai-${Date.now()}`,
        senderType: 'assistant',
        message: response.aiMessage?.message || response.message?.message || 'Message received.',
        createdAt: response.aiMessage?.createdAt || response.message?.createdAt || new Date().toISOString(),
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
      alert('Failed to send message. Please try again.');
    }
  };

  const handleEditData = (field: 'service' | 'zipcode' | 'budget' | 'requirements') => {
    setEditMode(field);
    setShowConfirmation(false);
    
    // Don't clear the field - keep the current value so user can see what they're editing
    // The new value will overwrite it when they submit
    
    if (field === 'service') {
      setShowServiceSelection(true);
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

      // Store session context in sessionStorage to preserve chat position when returning
      sessionStorage.setItem('ai_chat_session_id', session.sessionId);
      sessionStorage.setItem('ai_chat_active', 'true');

      // Navigate to provider page with AI flow parameters
      router.push(`/${slug}?from_ai=true&session_id=${session.sessionId}`);
      // Don't close chat - keep it open for return
    } catch (error) {
      console.error('Failed to navigate to provider:', error);
      alert('Failed to open provider page. Please try again.');
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
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
              <button
                onClick={startNewSession}
                className="text-xs bg-white text-navy-600 px-3 py-1 rounded hover:bg-gray-100 transition-colors font-semibold"
                title="Start a new conversation"
              >
                New Chat
              </button>
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
          ) : showSessionPrompt ? (
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
              {!showRecommendations && (
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
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Please Review Your Information</h3>
                    <p className="text-gray-600 mb-6">Please verify the details below before we find the best providers for you:</p>
                    
                    <div className="space-y-4 mb-6">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-700">Service</h4>
                            <p className="text-lg text-gray-900">{collectedData.service}</p>
                          </div>
                          <button 
                            onClick={() => handleEditData('service')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-700">Location</h4>
                            <p className="text-lg text-gray-900">{collectedData.zipcode}</p>
                          </div>
                          <button 
                            onClick={() => handleEditData('zipcode')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-700">Budget</h4>
                            <p className="text-lg text-gray-900">{collectedData.budget}</p>
                          </div>
                          <button 
                            onClick={() => handleEditData('budget')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-700">Requirements</h4>
                            <p className="text-lg text-gray-900 break-words">{collectedData.requirements}</p>
                          </div>
                          <button 
                            onClick={() => handleEditData('requirements')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline ml-4"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowConfirmation(false)}
                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                      >
                        Go Back
                      </button>
                      <button
                        onClick={handleConfirmAndProceed}
                        disabled={isGeneratingSummary}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingSummary ? 'Finding Providers...' : 'Confirm & Find Providers'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Provider Recommendations with Summary */}
              {showRecommendations && (
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                  {summary && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">Your Requirements Summary</h4>
                      {formatSummaryForDisplay(summary)}
                    </div>
                  )}

                  <h3 className="text-xl font-semibold mb-4">Recommended Providers</h3>
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
                              <span className="text-sm font-semibold">{provider.rating.toFixed(1)}</span>
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
              {!showRecommendations && !showConfirmation && (
                <div className="border-t border-gray-200 bg-white">
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
                        disabled={isSending || showServiceSelection}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={isSending || !input.trim() || showServiceSelection}
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
