import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignUpPage from '@/pages/SignUpPage'
import DoctorPortal from '@/pages/portals/DoctorPortal'
import PatientPortal from '@/pages/portals/PatientPortal'
import LabAttendantPortal from '@/pages/portals/LabAttendantPortal'
import PharmacyPortal from '@/pages/portals/PharmacyPortal'
import AmbulancePortal from '@/pages/portals/AmbulancePortal'
import HospitalAdminPortal from '@/pages/portals/HospitalAdminPortal'
import HealthMinistryPortal from '@/pages/portals/HealthMinistryPortal'
import { UserRole } from '@/lib/supabase'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { profile } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      
      <Route 
        path="/portal" 
        element={
          <ProtectedRoute>
            {profile?.role === 'doctor' && <DoctorPortal />}
            {profile?.role === 'patient' && <PatientPortal />}
            {profile?.role === 'lab_attendant' && <LabAttendantPortal />}
            {profile?.role === 'pharmacy' && <PharmacyPortal />}
            {profile?.role === 'ambulance' && <AmbulancePortal />}
            {profile?.role === 'hospital_admin' && <HospitalAdminPortal />}
            {profile?.role === 'health_ministry' && <HealthMinistryPortal />}
          </ProtectedRoute>
        } 
      />
      
      <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPortal /></ProtectedRoute>} />
      <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientPortal /></ProtectedRoute>} />
      <Route path="/lab" element={<ProtectedRoute allowedRoles={['lab_attendant']}><LabAttendantPortal /></ProtectedRoute>} />
      <Route path="/pharmacy" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyPortal /></ProtectedRoute>} />
      <Route path="/ambulance" element={<ProtectedRoute allowedRoles={['ambulance']}><AmbulancePortal /></ProtectedRoute>} />
      <Route path="/hospital-admin" element={<ProtectedRoute allowedRoles={['hospital_admin']}><HospitalAdminPortal /></ProtectedRoute>} />
      <Route path="/ministry" element={<ProtectedRoute allowedRoles={['health_ministry']}><HealthMinistryPortal /></ProtectedRoute>} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
