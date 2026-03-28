import { useState, Suspense, lazy } from 'react'
import LandingPage from './components/LandingPage'
import ContextIntro from './components/ContextIntro'
import LoadingState from './components/LoadingState'

const Dashboard = lazy(() => import('./components/Dashboard'))
const Quiz = lazy(() => import('./components/Quiz'))

// Three-stage flow: 'landing' → 'intro' → 'simulation'
function App() {
  const [stage, setStage] = useState('landing')
  const [showQuiz, setShowQuiz] = useState(false)

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><LoadingState message="Loading simulation..." /></div>}>
      {stage === 'landing' && (
        <LandingPage onEnterSimulation={() => setStage('intro')} />
      )}
      {stage === 'intro' && (
        <ContextIntro onComplete={() => setStage('simulation')} />
      )}
      {stage === 'simulation' && (
        <Dashboard onBackToIntro={() => setStage('landing')} onOpenQuiz={() => setShowQuiz(true)} />
      )}
      {showQuiz && (
        <Suspense fallback={<LoadingState message="Loading quiz..." />}>
          <Quiz onClose={() => setShowQuiz(false)} />
        </Suspense>
      )}
    </Suspense>
  )
}

export default App
