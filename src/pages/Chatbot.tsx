import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const botResponses: Record<string, string> = {
  hello: "Hey there, learner! 👋 How can I help you today?",
  hi: "Hi! Ready to learn something new? 📚",
  quiz: "Quizzes are a great way to earn coins! Head to the Quiz section and score 60% or higher to earn rewards. 🎯",
  coins: "You earn coins by completing quizzes! You can spend them in the Shop to buy furniture for your virtual house. 🪙",
  house: "Your virtual house has 3 rooms: Living Room, Study Room, and Bedroom. Buy furniture from the Shop, then drag and place them in your rooms! 🏠",
  shop: "The Shop has furniture for all 3 rooms. Each item has a coin price. Buy items and place them in your house! 🛒",
  level: "Your level increases as you gain XP. You earn XP by completing quizzes. Every 100 XP = 1 level up! ⭐",
  help: "I can help with: quizzes, coins, house building, shop, levels, and leaderboard. Just ask! 🤖",
  leaderboard: "The leaderboard shows top players ranked by coins. Keep completing quizzes to climb the ranks! 🏆",
  daily: "Complete at least one quiz every day! If you miss a day, you'll lose 5 coins as a penalty. ⚠️",
};

const getResponse = (input: string): string => {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(botResponses)) {
    if (lower.includes(key)) return response;
  }
  return "Hmm, I'm not sure about that. Try asking about quizzes, coins, house, shop, levels, or the leaderboard! 🤔";
};

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Hi! I'm LearnBot 🤖 Ask me anything about the app — quizzes, coins, house building, and more!" },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate typing delay
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: getResponse(userMsg.text) }]);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-fade-up h-[calc(100vh-4rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageCircle className="h-8 w-8 text-primary" /> AI Chat
        </h1>
        <p className="text-muted-foreground mt-1">Ask LearnBot anything about the app!</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
            >
              {msg.role === 'bot' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}
              >
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </CardContent>

        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Chatbot;
