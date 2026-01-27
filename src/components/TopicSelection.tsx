import { useEffect, useState } from 'react';
import { BookOpen, Leaf, Users, Smartphone, Sparkles, Heart, Trophy, RefreshCw } from 'lucide-react';
import { supabase, DebateTopic } from '../lib/supabase';

type TopicSelectionProps = {
  onSelectTopic: (topic: DebateTopic) => void;
};

const categoryIcons: Record<string, React.ReactNode> = {
  school: <BookOpen className="w-6 h-6" />,
  onderwijs: <BookOpen className="w-6 h-6" />,
  milieu: <Leaf className="w-6 h-6" />,
  maatschappij: <Users className="w-6 h-6" />,
  technologie: <Smartphone className="w-6 h-6" />,
  gezondheid: <Heart className="w-6 h-6" />,
  sport: <Trophy className="w-6 h-6" />,
  algemeen: <BookOpen className="w-6 h-6" />,
};

const categoryColors: Record<string, string> = {
  school: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  onderwijs: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  milieu: 'bg-green-50 border-green-200 hover:bg-green-100',
  maatschappij: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
  technologie: 'bg-teal-50 border-teal-200 hover:bg-teal-100',
  gezondheid: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
  sport: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
  algemeen: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
};

export default function TopicSelection({ onSelectTopic }: TopicSelectionProps) {
  const [topics, setTopics] = useState<DebateTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState('');

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

      const loadedTopics = data || [];
      setTopics(loadedTopics);

      // Auto-generate topics if list is empty
      if (loadedTopics.length === 0 && !generating) {
        console.log('No topics found, auto-generating...');
        generateNewTopics();
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generateNewTopics() {
    setGenerating(true);
    setGenerateMessage('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-topics`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ count: 4 }),
      });

      if (!response.ok) {
        throw new Error('Genereren mislukt');
      }

      const result = await response.json();

      if (result.success) {
        setGenerateMessage(`${result.count} nieuwe onderwerpen toegevoegd!`);
        await loadTopics();
        setTimeout(() => setGenerateMessage(''), 5000);
      } else {
        throw new Error(result.error || 'Onbekende fout');
      }
    } catch (error) {
      console.error('Error generating topics:', error);
      setGenerateMessage('Fout bij genereren. Probeer het later opnieuw.');
      setTimeout(() => setGenerateMessage(''), 5000);
    } finally {
      setGenerating(false);
    }
  }

  async function refreshAllTopics() {
    setGenerating(true);
    setGenerateMessage('');

    try {
      // Delete all existing topics
      const { error: deleteError } = await supabase
        .from('debate_topics')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) throw deleteError;

      // Generate new topics
      await generateNewTopics();
    } catch (error) {
      console.error('Error refreshing topics:', error);
      setGenerateMessage('Fout bij verversen. Probeer het later opnieuw.');
      setTimeout(() => setGenerateMessage(''), 5000);
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Onderwerpen laden...</p>
          {generating && (
            <p className="text-sm text-gray-500 mt-2">Actuele onderwerpen genereren via AI...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">DebatCoach</h1>
          <p className="text-lg text-gray-600 mb-6">
            Kies een onderwerp en oefen met debatteren
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={generateNewTopics}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              <Sparkles className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Bezig met genereren...' : 'Voeg onderwerpen toe'}
            </button>

            {topics.length > 0 && (
              <button
                onClick={refreshAllTopics}
                disabled={generating}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
                Vervang alle onderwerpen
              </button>
            )}
          </div>

          {generateMessage && (
            <div className={`mt-4 px-4 py-2 rounded-lg inline-block ${
              generateMessage.includes('Fout')
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {generateMessage}
            </div>
          )}
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
