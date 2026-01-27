import { useEffect, useState } from 'react';
import { BookOpen, Leaf, Users, Smartphone } from 'lucide-react';
import { supabase, DebateTopic } from '../lib/supabase';

type TopicSelectionProps = {
  onSelectTopic: (topic: DebateTopic) => void;
};

const categoryIcons: Record<string, React.ReactNode> = {
  school: <BookOpen className="w-6 h-6" />,
  milieu: <Leaf className="w-6 h-6" />,
  maatschappij: <Users className="w-6 h-6" />,
  technologie: <Smartphone className="w-6 h-6" />,
  algemeen: <BookOpen className="w-6 h-6" />,
};

const categoryColors: Record<string, string> = {
  school: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  milieu: 'bg-green-50 border-green-200 hover:bg-green-100',
  maatschappij: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
  technologie: 'bg-teal-50 border-teal-200 hover:bg-teal-100',
  algemeen: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
};

export default function TopicSelection({ onSelectTopic }: TopicSelectionProps) {
  const [topics, setTopics] = useState<DebateTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    try {
      const { data, error } = await supabase
        .from('debate_topics')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">DebatCoach</h1>
          <p className="text-lg text-gray-600">
            Kies een onderwerp en oefen met debatteren
          </p>
        </div>

        <div className="space-y-4">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] ${
                categoryColors[topic.category] || categoryColors.algemeen
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 text-gray-700">
                  {categoryIcons[topic.category] || categoryIcons.algemeen}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {topic.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">
                    {topic.title}
                  </h3>
                  {topic.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {topic.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
