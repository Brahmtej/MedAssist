import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { LogOut, Users, Calendar, Activity, Building } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function HospitalAdminPortal() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    try {
      // Load staff count
      const { data: staff } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('hospital_id', profile?.hospital_id)

      // Load appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('hospital_id', profile?.hospital_id)

      const today = new Date().toISOString().split('T')[0]
      const todayAppts = appointments?.filter(a => a.appointment_date === today) || []
      const pendingAppts = appointments?.filter(a => a.status === 'scheduled' || a.status === 'confirmed') || []

      setStats({
        totalStaff: staff?.length || 0,
        totalAppointments: appointments?.length || 0,
        todayAppointments: todayAppts.length,
        pendingAppointments: pendingAppts.length
      })
    } catch (error) {
      console.error('Error loading stats:', error)
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
            <h1 className="text-2xl font-bold text-orange-600">MedAssist - Hospital Admin Portal</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hospital Administration Dashboard</h2>
          <p className="text-gray-600">Manage hospital operations and monitor performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Staff"
            value={stats.totalStaff.toString()}
            icon={<Users size={24} />}
            color="blue"
          />
          <StatsCard
            title="Total Appointments"
            value={stats.totalAppointments.toString()}
            icon={<Calendar size={24} />}
            color="green"
          />
          <StatsCard
            title="Today's Appointments"
            value={stats.todayAppointments.toString()}
            icon={<Activity size={24} />}
            color="purple"
          />
          <StatsCard
            title="Pending Appointments"
            value={stats.pendingAppointments.toString()}
            icon={<Building size={24} />}
            color="orange"
          />
        </div>

        <div className="mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
              Overview
            </TabButton>
            <TabButton active={activeTab === 'staff'} onClick={() => setActiveTab('staff')}>
              Staff Management
            </TabButton>
            <TabButton active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>
              Appointments
            </TabButton>
            <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>
              Reports
            </TabButton>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <p className="text-gray-600">Hospital operations overview and recent activities will be displayed here.</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <ActionButton>View Staff Directory</ActionButton>
                <ActionButton>Manage Appointments</ActionButton>
                <ActionButton>Generate Reports</ActionButton>
                <ActionButton>Hospital Settings</ActionButton>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Staff Management</h3>
            <p className="text-gray-600">
              Staff directory, scheduling, and management tools will be available here.
              Currently showing {stats.totalStaff} staff members.
            </p>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Appointment Management</h3>
            <p className="text-gray-600">
              Comprehensive appointment scheduling and management system.
              Total appointments: {stats.totalAppointments}
            </p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Reports & Analytics</h3>
            <p className="text-gray-600">
              Hospital performance reports, analytics dashboards, and data insights.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color as keyof typeof colors]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
        active
          ? 'border-orange-600 text-orange-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

function ActionButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
      {children}
    </button>
  )
}
