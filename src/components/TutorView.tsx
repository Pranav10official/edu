import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Paperclip,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Mic,
  MicOff,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { askTutor } from '../services/api';
import { ChatMessage, ExplanationLevel } from '../types';

export const TutorView: React.FC = () => {
  const {
    language,
    explanationLevel,
    setExplanationLevel,
    academicStage,
    addXP,
    unlockBadge,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I am **EduGenie**, your personal AI tutor. 🧞✨\n\nI can explain any concept step-by-step, break down tough theories, and tailor answers to your preferred level: **${explanationLevel.toUpperCase()}**.\n\nWhat would you like to explore today?`,
      timestamp: Date.now(),
      level: explanationLevel,
      followUps: [
        'Explain Special Relativity using a train analogy',
        'How does CRISPR Cas-9 gene editing work?',
        'Why does standard deviation divide by (n - 1)?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Voice Input (Speech Recognition)
  const handleToggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        language === 'Tamil'
          ? 'ta-IN'
          : language === 'Hindi'
          ? 'hi-IN'
          : language === 'Spanish'
          ? 'es-ES'
          : language === 'French'
          ? 'fr-FR'
          : language === 'German'
          ? 'de-DE'
          : language === 'Japanese'
          ? 'ja-JP'
          : 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  // Text-to-Speech playback
  const handleToggleTTS = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown asterisks and code tags for cleaner speech
    const cleanText = text.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if ((!query.trim() && !selectedImage) || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: query.trim(),
      image: selectedImage || undefined,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    const currentImg = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const historyContext = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const reply = await askTutor({
        message: query,
        history: historyContext,
        level: explanationLevel,
        language,
        image: currentImg || undefined,
        context: `Academic Stage: ${academicStage}`,
      });

      // Extract follow-ups if present
      const followUpMatches = reply.match(/(?:Next questions to explore|Quick follow-up check|Explore further):?\s*([\s\S]*?)$/i);
      let parsedFollowUps: string[] = [];
      let mainText = reply;

      if (followUpMatches && followUpMatches[1]) {
        parsedFollowUps = followUpMatches[1]
          .split('\n')
          .map((line) => line.replace(/^[-*•\d.]+\s*/, '').trim())
          .filter((line) => line.length > 5 && line.length < 120)
          .slice(0, 3);
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: mainText,
        timestamp: Date.now(),
        level: explanationLevel,
        followUps: parsedFollowUps.length > 0 ? parsedFollowUps : [
          'Can you give another real-world example?',
          'How does this appear on an exam question?',
          'What is the common student mistake here?',
        ],
      };

      setMessages((prev) => [...prev, botMsg]);
      addXP(20, 'Consulted AI Personal Tutor');
      unlockBadge('first_question');
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `⚠️ I had a temporary issue connecting: ${err.message || 'Please verify your network connection.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Clear current tutor conversation?')) {
      setMessages([
        {
          id: 'fresh',
          role: 'assistant',
          text: `Chat cleared! What topic would you like to master next?`,
          timestamp: Date.now(),
          level: explanationLevel,
        },
      ]);
    }
  };

  const handleRegenerate = async () => {
    if (messages.length < 2 || isLoading) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.text);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto p-2 sm:p-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 mb-3 backdrop-blur shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              AI Personal Tutor
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {language}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive Socratic explanations & concept mastery
            </p>
          </div>
        </div>

        {/* Explanation Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['beginner', 'intermediate', 'advanced'] as ExplanationLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setExplanationLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition cursor-pointer ${
                explanationLevel === lvl
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={isLoading || messages.length < 2}
            title="Regenerate last response"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition cursor-pointer text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
          <button
            onClick={handleClear}
            title="Clear conversation"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 transition cursor-pointer text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800/90 text-slate-100 rounded-tl-none'
                }`}
              >
                {/* User Attached Image */}
                {msg.image && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-white/20 max-w-sm max-h-60 bg-black/40">
                    <img
                      src={msg.image}
                      alt="Uploaded query context"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Message Body */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Follow up suggestions */}
                {msg.followUps && msg.followUps.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="text-[11px] font-semibold text-indigo-300 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Suggested Follow-ups:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.followUps.map((fu, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(fu)}
                          className="text-left text-xs bg-slate-800/80 hover:bg-indigo-950/60 hover:border-indigo-500/40 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer flex items-center gap-1"
                        >
                          <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span>{fu}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Tools on Tutor messages */}
                {!isUser && (
                  <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/40">
                    <span className="text-[10px] text-slate-400">
                      Mode: {msg.level || explanationLevel}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleTTS(msg.text, msg.id)}
                        title={speakingMessageId === msg.id ? 'Stop audio' : 'Listen with Voice'}
                        className={`p-1 rounded hover:bg-slate-800 transition ${
                          speakingMessageId === msg.id ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {speakingMessageId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        title="Copy explanation"
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-indigo-300" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-sm text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>EduGenie is crafting your step-by-step explanation...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Preview Pill */}
      {selectedImage && (
        <div className="mt-2 flex items-center gap-2 bg-slate-900 border border-indigo-500/30 px-3 py-1.5 rounded-xl max-w-fit">
          <ImageIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-300 truncate max-w-xs">
            1 image attached for analysis
          </span>
          <button
            onClick={() => setSelectedImage(null)}
            className="text-xs text-rose-400 hover:text-rose-300 ml-2 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Input Form */}
      <div className="mt-3 relative bg-slate-900/90 border border-slate-800 focus-within:border-indigo-500/60 rounded-2xl p-2 transition shadow-lg">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Ask anything in ${language}... (e.g. "Explain Bernoulli's principle step-by-step")`}
          rows={2}
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none resize-none px-2 py-1"
        />

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 px-1">
          <div className="flex items-center gap-1.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach diagram, worksheet, or formula photo"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleVoiceInput}
              title={isListening ? 'Stop listening' : 'Speak your question'}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-indigo-300'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs px-3.5 py-1.5 rounded-xl shadow-md disabled:opacity-40 transition cursor-pointer"
          >
            <span>Ask Tutor</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
