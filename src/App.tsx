import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import FunnelDashboard from '@/components/FunnelDashboard';

type View = 'landing' | 'funnel';

function App() {
  const [view, setView] = useState<View>('landing');

  if (view === 'funnel') {
    return <FunnelDashboard onGoToLanding={() => setView('landing')} />;
  }

  return <LandingPage onGoToFunnel={() => setView('funnel')} />;
}

export default App;
