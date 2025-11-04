import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MessageCircle, X, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LandingPage() {
  const navigate = useNavigate()
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'bot'; message: string }>>([])
  const [chatLoading, setChatLoading] = useState(false)

  async function sendChatMessage() {
    if (!chatMessage.trim()) return

    const userMessage = chatMessage
    setChatMessage('')
    setChatHistory(prev => [...prev, { role: 'user', message: userMessage }])
    setChatLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('ai-chatbot', {
        body: { message: userMessage }
      })

      if (error) throw error

      const botResponse = data?.data?.message || 'Sorry, I could not process your request.'
      setChatHistory(prev => [...prev, { role: 'bot', message: botResponse }])
    } catch (error) {
      console.error('Chat error:', error)
      setChatHistory(prev => [...prev, { role: 'bot', message: 'Sorry, there was an error. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  MedAssist
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Comprehensive Healthcare
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Management Platform
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            MedAssist connects patients, doctors, laboratories, pharmacies, and healthcare administrators
            in a unified, secure platform for seamless healthcare delivery.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-3 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 text-lg font-medium text-blue-600 bg-white hover:bg-gray-50 rounded-lg transition-colors border-2 border-blue-600"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Doctor Portal"
            description="View patient history, prescribe medicines, manage appointments, and access lab reports."
            icon="👨‍⚕️"
          />
          <FeatureCard
            title="Patient Portal"
            description="Access health records, book appointments, view prescriptions, and download lab reports."
            icon="🏥"
          />
          <FeatureCard
            title="Lab Services"
            description="Upload and manage lab reports linked to patient records with secure access."
            icon="🔬"
          />
          <FeatureCard
            title="Pharmacy Access"
            description="Verify and dispense e-prescriptions with complete medication tracking."
            icon="💊"
          />
          <FeatureCard
            title="Emergency Services"
            description="Ambulance staff can access critical patient data during emergencies."
            icon="🚑"
          />
          <FeatureCard
            title="Analytics Dashboard"
            description="Health ministry access to national healthcare data and insights."
            icon="📊"
          />
        </div>
      </div>

      {/* Chatbot */}
      {chatOpen && (
        <div className="fixed bottom-24 right-8 w-96 bg-white rounded-lg shadow-2xl border border-gray-200">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">MedAssist Assistant</h3>
            <button onClick={() => setChatOpen(false)} className="hover:bg-blue-700 rounded p-1">
              <X size={20} />
            </button>
          </div>
          <div className="h-96 overflow-y-auto p-4 space-y-3">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>How can I help you today?</p>
              </div>
            )}
            {chatHistory.map((chat, index) => (
              <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${
                  chat.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendChatMessage}
                disabled={chatLoading || !chatMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center"
      >
        {chatOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            MedAssist - Comprehensive Healthcare Management Platform
          </p>
          <p className="text-gray-500 mt-2">
            Secure, HIPAA/NDHM Compliant Healthcare Solutions
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
