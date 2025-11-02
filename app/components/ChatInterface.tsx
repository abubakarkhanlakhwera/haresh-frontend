'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const EXAMPLE_PROMPTS = [
  "What diseases have been spreading in the last five weeks?",
  "What are the symptoms of influenza?",
  "How can I prevent COVID-19?",
  "Tell me about dengue fever prevention"
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      content: textToSend,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create a placeholder for the streaming response
    const assistantMessageIndex = messages.length + 1;
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsLoading(false);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                console.error('Stream error:', data.error);
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[assistantMessageIndex] = {
                    ...newMessages[assistantMessageIndex],
                    content: 'Sorry, I encountered an error. Please try again.'
                  };
                  return newMessages;
                });
                setIsLoading(false);
                break;
              }

              if (data.done) {
                setIsLoading(false);
                break;
              }

              // Update the message content with the new chunk
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[assistantMessageIndex] = {
                  ...newMessages[assistantMessageIndex],
                  content: newMessages[assistantMessageIndex].content + data.chunk
                };
                return newMessages;
              });
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[assistantMessageIndex] = {
          ...newMessages[assistantMessageIndex],
          content: 'Sorry, I encountered an error. Please try again.'
        };
        return newMessages;
      });
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    sendMessage(example);
  };

  return (
    <div className="flex flex-col h-[700px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50 overflow-hidden">
      {/* Enhanced Chat Header */}
      <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              Disease Information Assistant
            </h2>
            <p className="text-blue-100 text-sm">
              Powered by AI • Always available
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gradient-to-b from-zinc-50/50 to-white/50 dark:from-zinc-900/50 dark:to-zinc-900/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
              <div className="relative text-7xl mb-4">💬</div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                Start a Conversation
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-md mb-8">
                Ask me anything about diseases, symptoms, trends, and preventive measures. 
                I'm here to help!
              </p>
            </div>
            
            {/* Example Prompts */}
            <div className="w-full max-w-2xl">
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-500 mb-4">
                Try these examples:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="group p-4 text-left bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200"
                  >
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      "{example}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                } animate-fade-in-up`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                }`}>
                  <span className="text-lg">{message.role === 'user' ? '👤' : '🤖'}</span>
                </div>
                
                {/* Message Bubble */}
                <div className={`flex-1 max-w-[75%] ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div
                    className={`rounded-2xl px-5 py-4 shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 rounded-tl-none'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {message.content}
                      {/* Show cursor for the last assistant message if still loading */}
                      {message.role === 'assistant' && isLoading && index === messages.length - 1 && (
                        <span className="inline-block w-0.5 h-4 bg-blue-600 dark:bg-blue-400 ml-1 animate-pulse"></span>
                      )}
                    </p>
                    {message.timestamp && (
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-zinc-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Only show loading dots if we haven't started receiving the response yet */}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-4 animate-fade-in">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  <span className="text-lg">🤖</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-tl-none px-5 py-4 shadow-md">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Enhanced Input Container */}
      <div className="px-6 py-5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your health question..."
            className="flex-1 px-5 py-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-zinc-400"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100"
          >
            <span className="flex items-center gap-2">
              <span>Send</span>
              <span>✈️</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
