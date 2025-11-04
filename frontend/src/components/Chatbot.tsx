import { useState, useRef, useEffect } from 'react'
import { X, Send, MessageCircle, Minimize2 } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your MedAssist virtual assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Appointment-related questions
    if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
      if (lowerMessage.includes('how') || lowerMessage.includes('can i')) {
        return 'To book an appointment: 1) Go to the Appointments tab, 2) Click "Book New Appointment", 3) Select your hospital, 4) Choose a doctor, 5) Pick a date and time, 6) Enter the reason for your visit, and 7) Submit the form.'
      }
      if (lowerMessage.includes('cancel') || lowerMessage.includes('reschedule')) {
        return 'To cancel or reschedule an appointment, please contact your doctor directly or call the hospital. You can find their contact information in your appointment details.'
      }
      return 'You can book appointments through the Appointments tab. Select a hospital, choose a doctor, and pick your preferred date and time.'
    }

    // Profile-related questions
    if (lowerMessage.includes('profile') || lowerMessage.includes('information') || lowerMessage.includes('update')) {
      if (lowerMessage.includes('edit') || lowerMessage.includes('change') || lowerMessage.includes('update')) {
        return 'To update your profile: 1) Go to the Profile tab, 2) Click "Edit Profile", 3) Make your changes, and 4) Click "Save Changes". You can update your contact info, address, allergies, and emergency contact.'
      }
      return 'You can view and edit your profile information in the Profile tab. Click the "Edit Profile" button to make changes.'
    }

    // Prescription-related questions
    if (lowerMessage.includes('prescription') || lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
      if (lowerMessage.includes('scan') || lowerMessage.includes('upload')) {
        return 'To upload a prescription: 1) Go to the Prescriptions tab, 2) Click "Scan Prescription", 3) Upload an image or enter the prescription text, and 4) Submit. Your doctor will verify it.'
      }
      if (lowerMessage.includes('refill')) {
        return 'For prescription refills, please contact your doctor directly or schedule an appointment to discuss your medication needs.'
      }
      return 'You can view your prescriptions in the Prescriptions tab and upload new ones using the "Scan Prescription" feature.'
    }

    // Lab reports
    if (lowerMessage.includes('lab') || lowerMessage.includes('test') || lowerMessage.includes('results')) {
      return 'Your lab reports are available in the Lab Reports tab. You can view and download them there. If you need to schedule a new test, please book an appointment with your doctor.'
    }

    // Health ID
    if (lowerMessage.includes('health id') || lowerMessage.includes('patient id')) {
      return 'Your Health ID is displayed on your Profile page. You can find it in the Overview section as well.'
    }

    // Emergency
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      return '🚨 For medical emergencies, please call 911 immediately or go to the nearest emergency room. This chatbot is for non-urgent inquiries only.'
    }

    // Contact/Support
    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help')) {
      if (lowerMessage.includes('doctor') || lowerMessage.includes('hospital')) {
        return 'You can find your doctor\'s contact information in your appointment details or by visiting the hospital website.'
      }
      return 'For technical support, please email support@medassist.com or call our helpline at 1-800-MEDASSIST.'
    }

    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! How can I assist you with your healthcare needs today?'
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return 'You\'re welcome! Is there anything else I can help you with?'
    }

    // Hours/availability
    if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('available')) {
      return 'Our patient portal is available 24/7. Hospital hours vary by location. Please contact your specific hospital for their operating hours.'
    }

    // Default response with suggestions
    return 'I can help you with:\n• Booking appointments\n• Updating your profile\n• Uploading prescriptions\n• Viewing lab reports\n• General questions about using MedAssist\n\nWhat would you like to know more about?'
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')

    // Get bot response after short delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    }, 500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80' : 'w-96'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <h3 className="font-semibold">MedAssist Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-green-800 p-1 rounded transition-colors"
            >
              <Minimize2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="hover:bg-green-800 p-1 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-green-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-green-100' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        )}

        {isMinimized && (
          <div className="p-4 text-center text-sm text-gray-600">
            Click to expand chat
          </div>
        )}
      </div>
    </div>
  )
}
