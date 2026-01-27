import { RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { DebateTopic, Standpoint, Message } from '../lib/supabase';

type DebateSummaryProps = {
  topic: DebateTopic;
  standpoint: Standpoint;
  messages: Message[];
  summary: SummaryData;
  onNewDebate: () => void;
};

export type SummaryData = {
  userArguments: string[];
  coachArguments: string[];
  performanceScore: number;
  feedback: string;
};

export default function DebateSummary({
  topic,
  standpoint,
  summary,
  onNewDebate,
}: DebateSummaryProps) {
  const opponentStandpoint = standpoint === 'VOOR' ? 'TEGEN' : 'VOOR';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Debat afgelopen!
            </h1>
            <p className="text-gray-600">{topic.title}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Jouw argumenten ({standpoint})
                </h3>
              </div>
              <ul className="space-y-3">
                {summary.userArguments.map((arg, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">•</span>
                    <span className="text-gray-700 text-sm">{arg}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <ThumbsDown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Coach argumenten ({opponentStandpoint})
                </h3>
              </div>
              <ul className="space-y-3">
                {summary.coachArguments.map((arg, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                    <span className="text-gray-700 text-sm">{arg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Beoordeling</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Jouw prestatie
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {summary.performanceScore}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${summary.performanceScore * 10}%` }}
                />
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{summary.feedback}</p>
          </div>

          <button
            onClick={onNewDebate}
            className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Nieuw debat starten
          </button>
        </div>
      </div>
    </div>
  );
}
