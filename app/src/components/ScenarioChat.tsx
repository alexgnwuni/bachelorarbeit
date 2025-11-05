import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Scenario, ChatMessage } from "@/types/study";
import { Send, Loader2 } from "lucide-react";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

interface ScenarioChatProps {
  scenario: Scenario;
  onComplete: (messages: ChatMessage[]) => void;
}

const ScenarioChat = ({ scenario, onComplete }: ScenarioChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!OPENAI_API_KEY) {
      console.error('Missing VITE_OPENAI_API_KEY');
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: scenario.systemPrompt
            },
            ...messages,
            userMessage
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canComplete = messages.filter(m => m.role === 'user').length >= 3;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      <Card className="p-6 shadow-md">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {scenario.title}
        </h2>
        <p className="text-muted-foreground">
          {scenario.description}
        </p>
        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          Kategorie: {scenario.category === 'gender' ? 'Geschlecht' : 
                      scenario.category === 'age' ? 'Alter' :
                      scenario.category === 'ethnicity' ? 'Ethnische Herkunft' : 'Status'}
        </div>
      </Card>

      <Card className="h-[500px] flex flex-col shadow-md">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Beginnen Sie das Gespräch mit dem KI-System...
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gray-500 text-primary-foreground shadow'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Feld */}
        <div className="border-t p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ihre Nachricht..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {canComplete && (
            <Button
              onClick={() => onComplete(messages)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Gespräch beenden und bewerten
            </Button>
          )}
          
          {!canComplete && (
            <p className="text-xs text-muted-foreground text-center">
              Senden Sie mindestens 3 Nachrichten, bevor Sie fortfahren können
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ScenarioChat;
