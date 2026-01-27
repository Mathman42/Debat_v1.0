import { Check, X, RefreshCw } from 'lucide-react';
import { DebateTopic, Standpoint } from '../lib/supabase';

type StandpointSelectionProps = {
  topic: DebateTopic;
  onSelectStandpoint: (standpoint: Standpoint) => void;
  onBack: () => void;
};

export default function StandpointSelection({
  topic,
  onSelectStandpoint,
  onBack,
}: StandpointSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Kies een ander onderwerp</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4 uppercase tracking-wide">
              Stelling van vandaag
            </span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6 leading-tight">
            {topic.title}
          </h2>

          {topic.description && (
            <p className="text-center text-gray-600 leading-relaxed max-w-3xl mx-auto">
              {topic.description}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => onSelectStandpoint('VOOR')}
            className="group bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-green-400 transition-all duration-200 p-8 text-left transform hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-green-600">IK BEN VOOR</h3>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Check className="w-7 h-7 text-green-600" strokeWidth={3} />
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Verdedig dit standpunt en overtuig de AI coach van jouw gelijk.
            </p>
          </button>

          <button
            onClick={() => onSelectStandpoint('TEGEN')}
            className="group bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-red-400 transition-all duration-200 p-8 text-left transform hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-red-600">IK BEN TEGEN</h3>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <X className="w-7 h-7 text-red-600" strokeWidth={3} />
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Val de stelling aan met scherpe argumenten en weerleg de AI.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
