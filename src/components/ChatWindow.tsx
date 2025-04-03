// app/components/ChatWindow.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Send, 
  Phone, 
  RotateCw, 
  Bot, 
  User2, 
  Smile, 
  Info,
  MessageSquare,
  Clock
} from "lucide-react";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: string;
}

interface ChatWindowProps {
  userId: string;
}

export default function ChatWindow({ userId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! How can I assist you today?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Reset chat when user changes
  useEffect(() => {
    setMessages([
      {
        text: "Hello! How can I assist you today?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [userId]);

  // Focus input when component mounts or user changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [userId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      text: input, 
      isBot: false, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userId }),
      });
      
      const data = await res.json();
      
      const botMessage = { 
        text: data.reply, 
        isBot: true, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { 
          text: "Sorry, I'm having trouble connecting to the server. Please try again later or contact our support team directly.", 
          isBot: true, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        },
      ]);
    } finally {
      setIsLoading(false);
      // Focus the input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleCallSupport = () => {
    alert("Calling Odido Customer Support... (This is a mock action)");
  };

  const handleReset = () => {
    setMessages([
      {
        text: "Hello! How can I assist you today?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    // Focus the input after reset
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        handleSend();
      }
    }
  };

  return (
    <Card className="flex flex-col h-[600px] shadow-lg rounded-xl border-gray-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare size={18} className="mr-2" />
            Customer Support Chat
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-white hover:bg-blue-700 rounded-full flex items-center justify-center" 
              onClick={handleReset}
              title="Reset conversation"
            >
              <RotateCw size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-white hover:bg-blue-700 rounded-full flex items-center justify-center"
              onClick={handleCallSupport}
              title="Call support"
            >
              <Phone size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 overflow-hidden bg-gray-50">
        <ScrollArea className="h-full px-4 py-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} ${idx === 0 ? 'animate-fadeIn' : ''}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg shadow-sm ${
                    msg.isBot 
                      ? 'bg-white border-l-4 border-l-blue-400 text-gray-800' 
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {msg.isBot ? (
                      <span className="flex items-center text-xs font-medium text-blue-600">
                        <Bot size={14} className="mr-1" /> Support Bot
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-medium text-blue-100">
                        <User2 size={14} className="mr-1" /> You
                      </span>
                    )}
                  </div>
                  
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  
                  <div className={`flex items-center text-xs mt-2 ${msg.isBot ? 'text-gray-400' : 'text-blue-100'}`}>
                    <Clock size={12} className="mr-1" />
                    {msg.timestamp}
                  </div>
                  
                  {msg.isBot && msg.text.includes("Would you like to call now?") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                      onClick={handleCallSupport}
                    >
                      <Phone size={14} className="mr-2" />
                      Call Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-blue-400">
                  <div className="flex items-center mb-1">
                    <span className="flex items-center text-xs font-medium text-blue-600">
                      <Bot size={14} className="mr-1" /> Support Bot
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '100ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-4 border-t bg-white">
        <form 
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <div className="relative flex-grow">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="pr-10 pl-4 py-2 border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <Button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
              onClick={() => setInput(input + '😊')}
              disabled={isLoading}
            >
              <Smile size={18} />
            </Button>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
          >
            <Send size={16} className="mr-2" />
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}