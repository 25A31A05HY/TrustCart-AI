/**
 * TrustCart AI — Premium Conversational Shopping Feed & Workspace
 * Integrated natural-language shopping assistant with evidence citations,
 * product recommendations, and clarification prompts.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles,
  Mic,
  MicOff,
  Radio,
  RefreshCw
} from 'lucide-react';
import { ChatMessage, Product, Citation, UserConstraints } from '../types';
import { ProductCard } from './ProductCard';

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onRetry?: () => void;
  isLoading: boolean;
  onResetChat: () => void;
  onAddToCart: (product: Product) => void;
  onInspectProduct: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
  comparedProductIds: string[];
  onSelectCitation: (citation: Citation) => void;
  activeConstraints: UserConstraints;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  messages,
  onSendMessage,
  onRetry,
  isLoading,
  onResetChat,
  onAddToCart,
  onInspectProduct,
  onToggleCompare,
  comparedProductIds,
  onSelectCitation,
  activeConstraints
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initialize SpeechRecognition if available in the browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone access was denied. Please allow microphone permissions.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech detected. Please click the microphone to try again.');
        } else if (event.error === 'audio-capture') {
          setSpeechError('No microphone hardware detected.');
        } else {
          setSpeechError(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      console.warn('SpeechRecognition initialization error:', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      setSpeechError('Speech recognition is not supported in this browser.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current?.start();
      } catch (err: any) {
        console.warn('Error starting recognition:', err);
        // If already started or aborting, recreate or restart
        try {
          recognitionRef.current?.stop();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch (retryErr) {
          console.warn('Retry recognition start failed:', retryErr);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }
    const text = inputText;
    setInputText('');
    setSpeechError(null);
    onSendMessage(text);
  };

  const samplePrompts = [
    'Cotton shirts under ₹2,000',
    'Find laptops under $700 with 16GB RAM',
    'Compare Sony WH-1000XM5 and Bose QC Ultra',
    'What is your return policy on opened electronics?',
    'Can I get free shipping on a $35 order?',
    'Can you ship the WHOOP tracker overnight for tomorrow?'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto bg-white border border-[#E6E4DC] rounded-2xl shadow-xs overflow-hidden">
      
      {/* Session Top Bar */}
      <div className="px-5 py-3.5 bg-[#FBFBFA] border-b border-[#EAE8E0] flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-serif font-bold text-[#1A1A18] text-sm">Shopping Conversation</span>
          <span className="text-[#8A8880]">&bull;</span>
          <span className="text-[#686660]">Verified Grounding Active</span>
        </div>

        <button
          onClick={onResetChat}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#7A7870] hover:text-[#1A1A18] hover:bg-[#F0EFEA] transition-colors"
          title="Reset conversation state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#FAF9F6]">
        
        {messages.length === 0 && (
          <div className="py-10 text-center space-y-5 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-[#F0F4F1] border border-[#D5E0D7] flex items-center justify-center mx-auto text-[#2E4032]">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-[#1A1A18] tracking-tight">
                The Shopping Assistant That Doesn't Lie
              </h2>
              <p className="text-xs sm:text-sm text-[#66645E] leading-relaxed max-w-md mx-auto">
                Ask about products, compare specifications, or verify store policies. Factual answers are cross-referenced directly with verified catalogue records.
              </p>
            </div>

            {/* Curated Prompt Suggestions */}
            <div className="pt-2 text-left">
              <span className="text-[11px] uppercase tracking-wider text-[#8A8880] font-semibold block mb-2.5 text-center">
                Suggested shopping inquiries:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => onSendMessage(p)}
                    className="text-xs text-left px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F2F0EB] border border-[#E2E0D6] text-[#2C2B27] hover:text-[#1A1A18] transition-all flex items-center justify-between group shadow-2xs active:scale-[0.99]"
                  >
                    <span className="line-clamp-1">{p}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A09E95] group-hover:text-[#2E4032] shrink-0 ml-2 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-2xl space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Message Bubble */}
              <div
                className={`text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'p-3.5 sm:p-4 rounded-2xl rounded-tr-xs bg-[#EFECE5] text-[#1A1A18] font-medium shadow-2xs'
                    : msg.isError
                    ? 'p-4 sm:p-5 rounded-2xl rounded-tl-xs bg-[#FAF1EF] border border-[#E8D5D0] text-[#8F3E2B] shadow-xs'
                    : msg.refusalReason
                    ? 'p-4 sm:p-5 rounded-2xl rounded-tl-xs bg-[#FDF7F2] border border-[#E8D9CC] text-[#2C2B27] shadow-xs'
                    : 'p-4 sm:p-5 rounded-2xl rounded-tl-xs bg-white border border-[#E4E2D9] text-[#1A1A18] shadow-xs'
                }`}
              >
                {/* Error Notice Header if API error occurred */}
                {msg.isError ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1.5 text-[#8F3E2B] font-semibold pb-1.5 border-b border-[#E8D5D0] text-xs">
                      <AlertTriangle className="w-4 h-4 text-[#8F3E2B] shrink-0" />
                      <span>Gemini AI Processing Error</span>
                    </div>

                    <div className="whitespace-pre-wrap font-sans text-[#8F3E2B] leading-relaxed">
                      {msg.content}
                    </div>

                    {msg.errorDetails && (
                      <div className="p-2 rounded-lg bg-white border border-[#E8D5D0] text-[11px] font-mono text-[#8F3E2B]/80 break-words">
                        {msg.errorDetails}
                      </div>
                    )}

                    {msg.retryable && onRetry && (
                      <div className="pt-1.5">
                        <button
                          type="button"
                          onClick={onRetry}
                          disabled={isLoading}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2E4032] hover:bg-[#233226] text-white transition-colors shadow-2xs active:scale-95 disabled:opacity-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retry with Gemini</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Refusal Notice Header if triggered */}
                    {msg.refusalReason && (
                      <div className="flex items-center space-x-1.5 text-[#8F3E2B] font-semibold mb-2.5 pb-2 border-b border-[#E8D9CC] text-xs">
                        <AlertTriangle className="w-4 h-4 text-[#8F3E2B]" />
                        <span>Policy & Grounding Verification Note [{msg.refusalReason}]</span>
                      </div>
                    )}

                    {/* Main Text Content */}
                    <div className="whitespace-pre-wrap font-sans text-[#2C2B27] leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Grounding & Evidence Footer on Assistant Messages */}
                    {msg.role === 'assistant' && (
                      <div className="mt-3 pt-3 border-t border-[#F0EFEA] flex flex-wrap items-center justify-between gap-2 text-xs text-[#7A7870]">
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center space-x-1 text-[#2E4032] font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Grounded: {msg.claims.filter(c => c.status === 'VERIFIED').length} of {msg.claims.length} claims verified</span>
                          </span>
                        </div>

                        {msg.totalLatencyMs !== undefined && (
                          <span className="flex items-center space-x-1 font-mono text-[11px] text-[#8E8C84]">
                            <Clock className="w-3 h-3" />
                            <span>{msg.totalLatencyMs}ms</span>
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Clarification Options Strip */}
              {msg.clarificationOptions && msg.clarificationOptions.length > 0 && (
                <div className="p-3.5 bg-white border border-[#DDD9CF] rounded-xl space-y-2.5 shadow-2xs">
                  <span className="text-xs font-semibold text-[#1A1A18] block">
                    Please specify your preference:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.clarificationOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => onSendMessage(opt)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F6F5F1] hover:bg-[#EAE8E0] border border-[#DDD9CF] text-[#2E4032] transition-colors active:scale-[0.99]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Product Cards Grid */}
              {msg.retrievedProducts && msg.retrievedProducts.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-semibold text-[#66645E] block">
                    Verified Product Recommendations ({msg.retrievedProducts.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {msg.retrievedProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onAddToCart={onAddToCart}
                        onInspect={onInspectProduct}
                        onToggleCompare={onToggleCompare}
                        isCompared={comparedProductIds.includes(prod.id)}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Citations List */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  <span className="text-[#8A8880] mr-1">Evidence Sources:</span>
                  {msg.citations.map((cit) => (
                    <button
                      key={cit.id}
                      onClick={() => onSelectCitation(cit)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-white hover:bg-[#F2F0EB] border border-[#DDD9CF] text-[#2E4032] transition-colors"
                      title={cit.snippet}
                    >
                      <BookOpen className="w-3 h-3 text-[#3B523F]" />
                      <span className="underline decoration-dotted">{cit.sourceTitle}</span>
                    </button>
                  ))}
                </div>
              )}

            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-3">
            <div className="p-3.5 rounded-2xl bg-white border border-[#E2E0D6] text-xs text-[#686660] flex items-center space-x-2.5 shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#2E4032] animate-spin" />
              <span>Verifying catalogue records and validating factual claims...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Listening Active Strip or Speech Error Notice */}
      {isListening && (
        <div className="px-5 py-2.5 bg-[#F0F4F1] border-t border-[#D5E0D7] flex items-center justify-between text-xs text-[#2E4032] animate-fadeIn">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E4032] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2E4032]"></span>
            </span>
            <span className="font-medium">
              Listening... Speak your shopping question (e.g. &ldquo;Find laptops under $700&rdquo;)
            </span>
          </div>
          <button
            onClick={toggleSpeechRecognition}
            className="text-[11px] font-semibold underline underline-offset-2 hover:text-[#1A1A18] transition-colors"
          >
            Stop Listening
          </button>
        </div>
      )}

      {speechError && (
        <div className="px-5 py-2 bg-[#FAF1EF] border-t border-[#E8D5D0] flex items-center justify-between text-xs text-[#8F3E2B]">
          <div className="flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-[11px] underline underline-offset-2 hover:text-[#1A1A18]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Composer */}
      <div className="p-4 bg-[#FBFBFA] border-t border-[#E6E4DC]">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {/* Hands-Free Voice Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            disabled={isLoading}
            className={`p-3 rounded-xl border transition-all duration-200 shrink-0 flex items-center justify-center ${
              isListening
                ? 'bg-[#2E4032] text-white border-[#2E4032] ring-3 ring-[#2E4032]/25 shadow-xs animate-pulse'
                : 'bg-white hover:bg-[#F2F0EB] text-[#5A5850] hover:text-[#1A1A18] border-[#D5D3C9] shadow-2xs active:scale-95'
            }`}
            title={
              !speechSupported
                ? 'Speech recognition not supported in this browser'
                : isListening
                ? 'Listening... Click to stop voice input'
                : 'Ask hands-free with microphone'
            }
            aria-label={isListening ? 'Stop listening' : 'Start voice recognition'}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 animate-bounce" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to speech... (say your question)'
                : "Ask anything (e.g., 'Find laptops under $700' or 'Return policy on opened electronics')..."
            }
            disabled={isLoading}
            className="flex-1 bg-white border border-[#D5D3C9] focus:border-[#2E4032] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#1A1A18] placeholder-[#94928A] focus:outline-none transition-colors shadow-2xs"
          />

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-3 bg-[#2E4032] hover:bg-[#233226] disabled:bg-[#EAE8E0] disabled:text-[#A09E95] text-white font-medium rounded-xl transition-all shadow-xs active:scale-95 shrink-0"
            aria-label="Send message"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
