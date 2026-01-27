import { useState } from 'react';
import TopicSelection from './components/TopicSelection';
import StandpointSelection from './components/StandpointSelection';
import TurnLimitSelection from './components/TurnLimitSelection';
import DebateChat from './components/DebateChat';
import DebateSummary, { SummaryData } from './components/DebateSummary';
import { DebateTopic, Standpoint, Message } from './lib/supabase';

type AppState =
  | { screen: 'topic' }
  | { screen: 'standpoint'; topic: DebateTopic }
  | { screen: 'turnlimit'; topic: DebateTopic; standpoint: Standpoint }
  | { screen: 'debate'; topic: DebateTopic; standpoint: Standpoint; turnLimit: number }
  | { screen: 'summary'; topic: DebateTopic; standpoint: Standpoint; messages: Message[]; summary: SummaryData };

function App() {
  const [state, setState] = useState<AppState>({ screen: 'topic' });

  function handleSelectTopic(topic: DebateTopic) {
    setState({ screen: 'standpoint', topic });
  }

  function handleSelectStandpoint(standpoint: Standpoint) {
    if (state.screen === 'standpoint') {
      setState({ screen: 'turnlimit', topic: state.topic, standpoint });
    }
  }

  function handleStartDebate(turnLimit: number) {
    if (state.screen === 'turnlimit') {
      setState({ screen: 'debate', topic: state.topic, standpoint: state.standpoint, turnLimit });
    }
  }

  function handleDebateFinished(messages: Message[], summary: SummaryData) {
    if (state.screen === 'debate') {
      setState({ screen: 'summary', topic: state.topic, standpoint: state.standpoint, messages, summary });
    }
  }

  function handleBackToStandpoint() {
    if (state.screen === 'turnlimit') {
      setState({ screen: 'standpoint', topic: state.topic });
    }
  }

  function handleBack() {
    setState({ screen: 'topic' });
  }

  if (state.screen === 'topic') {
    return <TopicSelection onSelectTopic={handleSelectTopic} />;
  }

  if (state.screen === 'standpoint') {
    return (
      <StandpointSelection
        topic={state.topic}
        onSelectStandpoint={handleSelectStandpoint}
        onBack={handleBack}
      />
    );
  }

  if (state.screen === 'turnlimit') {
    return (
      <TurnLimitSelection
        topic={state.topic}
        standpoint={state.standpoint}
        onStart={handleStartDebate}
        onBack={handleBackToStandpoint}
      />
    );
  }

  if (state.screen === 'debate') {
    return (
      <DebateChat
        topic={state.topic}
        standpoint={state.standpoint}
        turnLimit={state.turnLimit}
        onBack={handleBack}
        onFinished={handleDebateFinished}
      />
    );
  }

  if (state.screen === 'summary') {
    return (
      <DebateSummary
        topic={state.topic}
        standpoint={state.standpoint}
        messages={state.messages}
        summary={state.summary}
        onNewDebate={handleBack}
      />
    );
  }

  return null;
}

export default App;
