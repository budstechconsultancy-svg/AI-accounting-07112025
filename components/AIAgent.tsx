import React, { useState, useEffect, useRef } from 'react';
import type { AgentMessage } from '../types';
import Icon from './Icon';

interface AIAgentProps {
  isOpen: boolean;
  onClose: () => void;
  messages: AgentMessage[];
  onSendMessage: (message: string, useGrounding: boolean) => void;
  isLoading: boolean;
}

const AIAgent: React.FC<AIAgentProps> = ({ isOpen, onClose, messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [useGrounding, setUseGrounding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim(), useGrounding);
      setInput('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-end justify-end">
      <div className="bg-white w-full max-w-md h-[70vh] m-8 rounded-xl shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
                <Icon name="sparkles" className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">AI Assistant</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index}>
                <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0"><Icon name="sparkles" className="w-5 h-5 text-slate-500" /></div>}
                <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                    {msg.text}
                </div>
                </div>
                {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 ml-10 text-xs text-gray-500">
                        <p className="font-semibold mb-1">Sources:</p>
                        <ul className="space-y-1">
                            {msg.sources.map((source, i) => (
                                <li key={i} className="truncate">
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {i+1}. {source.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
               <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0"><Icon name="sparkles" className="w-5 h-5 text-slate-500" /></div>
               <div className="max-w-xs rounded-lg px-4 py-2 bg-gray-100 text-gray-800 rounded-bl-none">
                 <div className="flex items-center justify-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about your data..."
              rows={1}
              className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full p-2 disabled:bg-gray-300 hover:bg-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.105 3.105a.75.75 0 01.053 1.053L6.37 8.25H13.5a.75.75 0 010 1.5H6.37l-3.212 4.092a.75.75 0 01-1.106-.998l3.75-4.75a.75.75 0 010-.998l-3.75-4.75a.75.75 0 011.053-.053z"></path></svg>
            </button>
          </div>
          <div className="flex items-center justify-center mt-2">
            <label htmlFor="grounding-toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                    <input type="checkbox" id="grounding-toggle" className="sr-only" checked={useGrounding} onChange={() => setUseGrounding(!useGrounding)} />
                    <div className="block bg-gray-200 w-10 h-6 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useGrounding ? 'translate-x-full bg-blue-600' : ''}`}></div>
                </div>
                <div className="ml-3 text-xs text-gray-600">Search the web</div>
            </label>
           </div>
        </div>
        <style>{`
          @keyframes slide-in {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
          .animate-bounce { animation: bounce 1s infinite; }
          @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
          .delay-75 { animation-delay: 0.075s; }
          .delay-150 { animation-delay: 0.150s; }
        `}</style>
      </div>
    </div>
  );
};

export default AIAgent;