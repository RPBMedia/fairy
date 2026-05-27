import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import EmailComposer from './components/EmailComposer.jsx'
import CalendarEvent from './components/CalendarEvent.jsx'
import WhatsAppComposer from './components/WhatsAppComposer.jsx'
import ChatGPT from './components/ChatGPT.jsx'
import AskFairy from './components/AskFairy.jsx'

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')

  const views = {
    dashboard: <Dashboard onNavigate={setActiveView} />,
    email: <EmailComposer onBack={() => setActiveView('dashboard')} />,
    calendar: <CalendarEvent onBack={() => setActiveView('dashboard')} />,
    whatsapp: <WhatsAppComposer onBack={() => setActiveView('dashboard')} />,
    chatgpt: <ChatGPT onBack={() => setActiveView('dashboard')} />,
    ask: <AskFairy onBack={() => setActiveView('dashboard')} />,
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        background: 'var(--bg)',
      }}>
        {views[activeView] || views.dashboard}
      </main>
    </div>
  )
}
