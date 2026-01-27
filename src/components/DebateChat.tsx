import { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw, User, Bot } from 'lucide-react';
import { supabase, DebateTopic, Standpoint, Message } from '../lib/supabase';
import { SummaryData } from './DebateSummary';

type DebateChatProps = {
  topic: DebateTopic;
  standpoint: Standpoint;
  turnLimit: number;
  onBack: () => void;
  onFinished: (messages: Message[], summary: SummaryData) => void;
};

export default function DebateChat({ topic, standpoint, turnLimit, onBack, onFinished }: DebateChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function initializeSession() {
    try {
      const { data, error } = await supabase
        .from('debate_sessions')
        .insert({
          topic_id: topic.id,
          standpoint: standpoint,
          messages: [],
          turn_limit: turnLimit,
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);

      const welcomeMessage: Message = {
        role: 'coach',
        content: getWelcomeMessage(),
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
      await updateSessionMessages([welcomeMessage], data.id);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }

  function getWelcomeMessage(): string {
    const opponent = standpoint === 'VOOR' ? 'TEGEN' : 'VOOR';
    return `Welkom bij dit debat! Jij verdedigt het standpunt "${standpoint}" en ik neem het standpunt "${opponent}". Begin maar met je opening of stel me een vraag!`;
  }

  async function updateSessionMessages(newMessages: Message[], id: string = sessionId!) {
    if (!id) return;

    try {
      await supabase
        .from('debate_sessions')
        .update({
          messages: newMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }

  async function handleSendMessage() {
    if (!input.trim() || loading || !sessionId || currentTurn >= turnLimit) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const newTurn = currentTurn + 1;
    setCurrentTurn(newTurn);

    try {
      await updateSessionMessages(updatedMessages);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debate-coach`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: topic.title,
            standpoint: standpoint === 'VOOR' ? 'TEGEN' : 'VOOR',
            userInput: userMessage.content,
            isSensitive: topic.is_sensitive,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to get coach response');

      const data = await response.json();
      const coachMessage: Message = {
        role: 'coach',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, coachMessage];
      setMessages(finalMessages);
      await updateSessionMessages(finalMessages);

      if (newTurn >= turnLimit) {
        await generateSummary(finalMessages);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'coach',
        content: 'Sorry, er ging iets mis. Probeer het opnieuw.',
        timestamp: new Date().toISOString(),
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  async function generateSummary(finalMessages: Message[]) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debate-coach`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: topic.title,
            standpoint: standpoint,
            messages: finalMessages,
            generateSummary: true,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate summary');

      const data = await response.json();

      await supabase
        .from('debate_sessions')
        .update({
          summary: data.summary,
          completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      onFinished(finalMessages, data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const opponentStandpoint = standpoint === 'VOOR' ? 'TEGEN' : 'VOOR';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="mb-3 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Nieuw debat</span>
          </button>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{topic.title}</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                  Jij: {standpoint}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                  Coach: {opponentStandpoint}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold">
                  Beurt {currentTurn}/{turnLimit}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'coach' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-2xl rounded-2xl px-5 py-3 ${
                  message.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-900 shadow-md border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-gray-200">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentTurn >= turnLimit ? "Debat afgelopen - bekijk je samenvatting" : "Typ je argument of vraag..."}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading || currentTurn >= turnLimit}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || currentTurn >= turnLimit}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-semibold"
            >
              <Send className="w-5 h-5" />
              <span>Verstuur</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
