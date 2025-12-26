'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { aiChatApi, AiChatSession, AiChatMessage, RecommendedProvider } from '@/api/ai-chat';
import { homepageApi } from '@/api/homepage';
import { generateProviderSlug } from '@/lib/slug';

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
    const text = newMessage.toLowerCase();

    // 1. Check for service mentions first (using dynamic services list)
    // Also match partial keywords (e.g., "cleaning" matches "House Cleaning")
    let foundService = false;
    services.forEach((service) => {
      const serviceLower = service.name.toLowerCase();
      if (text.includes(serviceLower) || serviceLower.includes(text.split(/\s+/)[0])) {
        extracted.service = service.name;
        foundService = true;
      }
    });

    // Fallback: if services list is empty or service not found, try common keywords
    if (!foundService) {
      const commonServices = [
        { keyword: 'plumbing', display: 'Plumbing' },
        { keyword: 'electrical', display: 'Electrical' },
        { keyword: 'cleaning', display: 'Cleaning' },
        { keyword: 'painting', display: 'Painting' },
        { keyword: 'hvac', display: 'HVAC' },
        { keyword: 'landscaping', display: 'Landscaping' },
        { keyword: 'roofing', display: 'Roofing' },
        { keyword: 'flooring', display: 'Flooring' },
      ];
      commonServices.forEach(({ keyword, display }) => {
        if (text.includes(keyword)) {
          extracted.service = display;
        }
      });
    }

    // 2. Extract zipcode FIRST (5 consecutive digits, highest priority)
    // Zipcodes are typically mentioned as standalone 5-digit numbers
    const zipcodeMatch = newMessage.match(/\b\d{5}\b/);
    let foundZipcode = false;
    if (zipcodeMatch) {
      extracted.zipcode = zipcodeMatch[0];
      foundZipcode = true;
    }

    // 3. Extract budget with multiple formats
    // Don't extract as budget if it looks like a zipcode
    if (!foundZipcode) {
      // Pattern: "$X", "X dollars", "X$", "budget of X", "costs X", etc.
      let budgetMatch = null;
      
      // Try "$200" format
      budgetMatch = newMessage.match(/\$\s*(\d+(?:\.\d{2})?)/);
      if (budgetMatch) {
        extracted.budget = '$' + budgetMatch[1];
      } else {
        // Try "200$" format (dollar sign after number)
        budgetMatch = newMessage.match(/(\d+(?:\.\d{2})?)\s*\$/);
        if (budgetMatch) {
          extracted.budget = budgetMatch[1] + '$';
        } else {
          // Try "X dollars" format
          budgetMatch = newMessage.match(/(\d+(?:\.\d{2})?)\s*dollars/i);
          if (budgetMatch) {
            extracted.budget = '$' + budgetMatch[1];
          } else {
            // Look for budget with context words
            budgetMatch = newMessage.match(
              /(?:budget|cost|price|maximum|max|around|spend)\s*(?:is|of|around)?\s*(\$?\d+(?:\.\d{2})?)/i
            );
            if (budgetMatch) {
              extracted.budget = budgetMatch[1].startsWith('$') ? budgetMatch[1] : '$' + budgetMatch[1];
            }
          }
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

    // Keywords that indicate requirements/preferences
    const requirementKeywords = [
      'eco-friendly',
      'same-day',
      'insured',
      'certified',
      'experienced',
      'professional',
      'fast',
      'affordable',
      'premium',
      'budget',
      'urgent',
      'asap',
      'special',
      'requirement',
      'preference',
      'need',
      'want',
      'bathroom',
      'kitchen',
      'bedroom',
      'living',
      'yard',
      'garden',
    ];

    // Only process user messages (senderType === 'user')
    msgs.forEach((msg, idx) => {
      if (msg.senderType === 'user') {
        const extracted = extractDataFromMessages(msg.message);
        // Update with any newly extracted data (only fill empty fields)
        if (extracted.service && !allData.service) allData.service = extracted.service;
        if (extracted.budget && !allData.budget) allData.budget = extracted.budget;
        if (extracted.zipcode && !allData.zipcode) allData.zipcode = extracted.zipcode;
        if (extracted.location && !allData.location) allData.location = extracted.location;

        // Requirements detection: improved logic
        if (!allData.requirements) {
          const msgLower = msg.message.toLowerCase();
          const msgLength = msg.message.length;
          const msgText = msg.message;

          // Check if user explicitly answered "no requirements"
          if (msgLower.includes('no requirement') || msgLower.includes('no preference') || msgLower.includes('no special')) {
            allData.requirements = 'No special requirements';
          }
          // If message is NOT just a service/zipcode/budget and contains requirement keywords
          else if (
            msgLength > 15 &&
            !services.some((s) => msgText.toLowerCase().trim() === s.name.toLowerCase()) &&
            !msgText.match(/^\d{5}$/) &&
            !msgText.match(/^\d+\$?$/) &&
            !msgText.match(/^\$?\d+$/) &&
            requirementKeywords.some((kw) => msgLower.includes(kw))
          ) {
            // This is likely a requirements message
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

  // Auto-extract data from all messages whenever messages change
  useEffect(() => {
    if (messages.length > 0 && session) {
      const extracted = extractDataFromAllMessages(messages);
      setCollectedData(extracted);
    }
  }, [messages, services]);

  const loadActiveSession = async () => {
    try {
      setIsLoading(true);
      const activeSession = await aiChatApi.getActiveSession();
      
      if (activeSession) {
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

    setIsSending(true);
    setInput('');

    // Extract data from this message
    const newData = extractDataFromMessages(text);
    
    // Check if user mentioned a broad service keyword that matches multiple specific services
    const keywordMatch = text.toLowerCase().match(/\b(cleaning|plumbing|electrical|hvac|painting|landscaping|roofing|flooring)\b/);
    if (keywordMatch && !collectedData.service) {
      const keyword = keywordMatch[0];
      const matchingServices = findMatchingServices(keyword);
      
      // If multiple services match this keyword, ask for clarification
      if (matchingServices.length > 1) {
        const userMessage: AiChatMessage = {
          id: `temp-${Date.now()}`,
          senderType: 'user',
          message: text,
          createdAt: new Date().toISOString(),
        };

        const clarificationMessage = `I found multiple ${keyword} services available:\n\n${matchingServices.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}\n\nWhich one would you like?`;

        const aiMessage: AiChatMessage = {
          id: `ai-${Date.now()}-clarify`,
          senderType: 'assistant',
          message: clarificationMessage,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage, aiMessage]);
        setIsSending(false);
        return;
      }
    }

    setCollectedData((prev) => ({
      ...prev,
      ...newData,
    }));

    // Check if user is asking about services
    if (isAskingAboutServices(text)) {
      const userMessage: AiChatMessage = {
        id: `temp-${Date.now()}`,
        senderType: 'user',
        message: text,
        createdAt: new Date().toISOString(),
      };

      // Display services list or fallback message if services haven't loaded
      let servicesListMessage = '';
      if (services.length > 0) {
        servicesListMessage = `Here are the services available on our platform:\n\n${services.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}\n\nWhich service are you interested in?`;
      } else {
        servicesListMessage = `Here are the services available on our platform:\n\n1. Plumbing\n2. Electrical\n3. House Cleaning\n4. Painting\n5. HVAC\n6. Landscaping\n7. Roofing\n8. Flooring\n\nWhich service are you interested in?`;
      }

      const aiMessage: AiChatMessage = {
        id: `ai-${Date.now()}-services`,
        senderType: 'assistant',
        message: servicesListMessage,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, aiMessage]);
      setIsSending(false);
      return;
    }

    // Add user message optimistically
    const userMessage: AiChatMessage = {
      id: `temp-${Date.now()}`,
      senderType: 'user',
      message: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await aiChatApi.sendMessage(session.sessionId, text);

      // Replace temp message with real one and add AI response
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== userMessage.id);
        return [...filtered, response.userMessage, response.aiMessage];
      });
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

    // Validate required data
    if (!isRequiredDataComplete()) {
      const missing = [];
      if (!collectedData.service) missing.push('Service');
      if (!collectedData.budget) missing.push('Budget');
      if (!collectedData.zipcode) missing.push('Zipcode');
      if (!collectedData.requirements) missing.push('Requirements');

      alert(`Please provide the following information:\n\n${missing.join('\n')}`);
      return;
    }

    try {
      setIsGeneratingSummary(true);

      // Generate summary first
      const summaryResult = await aiChatApi.generateSummary(session.sessionId);
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

                  <div ref={messagesEndRef} />
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
              {!showRecommendations && (
                <div className="border-t border-gray-200 bg-white">
                  {/* Data collection indicator */}
                  <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 space-y-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div className={collectedData.service ? 'text-green-600' : 'text-gray-500'}>
                        {collectedData.service ? '✓' : '○'} Service: {collectedData.service || 'Not provided'}
                      </div>
                      <div className={collectedData.budget ? 'text-green-600' : 'text-gray-500'}>
                        {collectedData.budget ? '✓' : '○'} Budget: {collectedData.budget || 'Not provided'}
                      </div>
                      <div className={collectedData.zipcode ? 'text-green-600' : 'text-gray-500'}>
                        {collectedData.zipcode ? '✓' : '○'} Zipcode: {collectedData.zipcode || 'Not provided'}
                      </div>
                      <div className={collectedData.requirements ? 'text-green-600' : 'text-gray-500'}>
                        {collectedData.requirements ? '✓' : '○'} Requirements: {collectedData.requirements || 'Not provided'}
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
                        placeholder="Tell me about the service you need..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm text-black placeholder-gray-500"
                        disabled={isSending}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={isSending || !input.trim()}
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
                          : 'Click to generate summary and get recommendations'
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
