import { useState } from 'react'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'

function App() {
  const [showSimulation, setShowSimulation] = useState(false)

  if (!showSimulation) {
    return <LandingPage onEnterSimulation={() => setShowSimulation(true)} />
  }

  return (
    <Dashboard onBackToIntro={() => setShowSimulation(false)} />
  )
}

export default App
