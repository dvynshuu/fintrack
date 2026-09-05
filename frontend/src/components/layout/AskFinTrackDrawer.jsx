import React, { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import './AskFinTrackDrawer.css';

const SUGGESTED_QUERIES = [
  'How much can I spend safely this week?',
  'How long would my savings last in an emergency?',
  'Where did most of my money go recently?',
  'How is my money divided across my bank accounts?'
];

const AskFinTrackDrawer = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your FinTrack money assistant. Ask me anything about your spending, savings, or bank balances, and I'll give you clear, simple answers based on your actual accounts.",
      evidence: null
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText) => {
    const text = queryText || inputQuery;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await api.post('/api/ai/ask', { question: text });
      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.data.answer || 'Here is what your finances look like.',
        evidence: res.data.evidence
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Unable to reach the assistant right now. Please check your network connection.',
          evidence: null
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ask-fintrack-overlay" onClick={onClose}>
      <div className="ask-fintrack-drawer animate-slide-left" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="ask-drawer-header">
          <div className="ask-header-title">
            <div className="ask-icon-wrap">
              <Sparkles size={18} />
            </div>
            <div>
              <h3>Ask FinTrack</h3>
              <span className="ask-badge">Personal Money Assistant</span>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close assistant">
            <X size={18} />
          </button>
        </div>

        {/* Suggested Queries Chips */}
        <div className="suggested-chips-container">
          <span className="chips-label">Quick questions you can ask:</span>
          <div className="chips-scroll">
            {SUGGESTED_QUERIES.map((q, i) => (
              <button
                key={i}
                className="query-chip"
                onClick={() => handleSend(q)}
                disabled={isLoading}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Body */}
        <div className="ask-messages-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="message-content-wrap">
                <div className="message-bubble">{msg.content}</div>

                {msg.evidence && (
                  <div className="message-evidence-badge">
                    <ShieldCheck size={12} />
                    <span>
                      Based on your real accounts: Net Worth ₹{(msg.evidence.totalAssets - msg.evidence.totalDebt).toLocaleString('en-IN')} • In Bank ₹{msg.evidence.totalAssets.toLocaleString('en-IN')} • Income ₹{msg.evidence.totalIncome.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-message assistant">
              <div className="message-avatar">
                <Bot size={16} />
              </div>
              <div className="message-content-wrap">
                <div className="message-bubble loading-bubble">
                  <RefreshCw className="spin-icon" size={14} />
                  <span>Checking your accounts...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          className="ask-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="ask-input-field"
            placeholder="Ask anything about your money, savings, or spending..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn-send"
            disabled={!inputQuery.trim() || isLoading}
            aria-label="Send inquiry"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AskFinTrackDrawer;
