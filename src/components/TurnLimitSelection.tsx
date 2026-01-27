import { useState } from 'react';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { DebateTopic, Standpoint } from '../lib/supabase';

type TurnLimitSelectionProps = {
  topic: DebateTopic;
  standpoint: Standpoint;
  onStart: (turnLimit: number) => void;
  onBack: () => void;
};

const TURN_OPTIONS = [3, 5, 8, 10];

export default function TurnLimitSelection({
  topic,
  standpoint,
  onStart,
  onBack,
}: TurnLimitSelectionProps) {
  const [selectedTurns, setSelectedTurns] = useState(5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Terug</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Hoeveel beurten wil je debatteren?
            </h2>
            <p className="text-gray-600">
              Kies het aantal keer dat je mag reageren
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3 text-center">
              Jouw standpunt: <span className="font-semibold">{standpoint}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {TURN_OPTIONS.map((turns) => (
              <button
                key={turns}
                onClick={() => setSelectedTurns(turns)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedTurns === turns
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {turns}
                </div>
                <div className="text-sm text-gray-600">
                  {turns === 3 && 'Snel debat'}
                  {turns === 5 && 'Kort debat'}
                  {turns === 8 && 'Normaal debat'}
                  {turns === 10 && 'Lang debat'}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => onStart(selectedTurns)}
            className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            Start het debat
          </button>
        </div>
      </div>
    </div>
  );
}
