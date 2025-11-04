import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { LogOut, BarChart3, TrendingUp, Users, Building } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function HealthMinistryPortal() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [reportType, setReportType] = useState('patient_demographics')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function generateReport() {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('analytics-generator', {
        body: {
          reportType,
          startDate: null,
          endDate: null,
          region: null
        }
      })

      if (error) throw error

      if (data?.data?.analytics) {
        setAnalyticsData(data.data.analytics)
      }
    } catch (error: any) {
      console.error('Analytics error:', error)
      alert('Error generating report: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-teal-600">MedAssist - Health Ministry Portal</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{profile?.full_name}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">National Healthcare Analytics</h2>
          <p className="text-gray-600">Access anonymized national healthcare data and insights</p>
        </div>

        <div className="mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
              <TrendingUp size={18} />
              Overview
            </TabButton>
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
              <BarChart3 size={18} />
              Analytics
            </TabButton>
            <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>
              <Users size={18} />
              Reports
            </TabButton>
            <TabButton active={activeTab === 'hospitals'} onClick={() => setActiveTab('hospitals')}>
              <Building size={18} />
              Hospitals
            </TabButton>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatsCard
              title="Total Patients"
              value="Generating..."
              description="Anonymized patient data"
              color="blue"
            />
            <StatsCard
              title="Healthcare Facilities"
              value="Generating..."
              description="Registered hospitals"
              color="green"
            />
            <StatsCard
              title="Active Prescriptions"
              value="Generating..."
              description="E-prescriptions issued"
              color="purple"
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-6">Generate Analytics Report</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="patient_demographics">Patient Demographics</option>
                <option value="appointments_statistics">Appointments Statistics</option>
                <option value="prescription_analytics">Prescription Analytics</option>
                <option value="hospital_capacity">Hospital Capacity Analysis</option>
              </select>
            </div>

            <button
              onClick={generateReport}
              disabled={loading}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating Report...' : 'Generate Report'}
            </button>

            {analyticsData && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-lg mb-4">Report Results</h4>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(analyticsData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Historical Reports</h3>
            <p className="text-gray-600">
              Access historical healthcare reports and trend analysis data.
              Reports are anonymized to protect patient privacy.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReportCard title="Monthly Health Statistics" date="November 2025" />
              <ReportCard title="Disease Surveillance Report" date="October 2025" />
              <ReportCard title="Hospital Capacity Analysis" date="September 2025" />
              <ReportCard title="Prescription Trends" date="August 2025" />
            </div>
          </div>
        )}

        {activeTab === 'hospitals' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Hospital Network Overview</h3>
            <p className="text-gray-600">
              View and analyze data from all registered healthcare facilities across the nation.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
        active
          ? 'border-teal-600 text-teal-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

function StatsCard({ title, value, description, color }: { title: string; value: string; description: string; color: string }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200'
  }

  return (
    <div className={`rounded-lg border-2 p-6 ${colors[color as keyof typeof colors]}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}

function ReportCard({ title, date }: { title: string; date: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600 mt-1">{date}</p>
    </div>
  )
}
