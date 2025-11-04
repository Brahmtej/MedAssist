import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { LogOut, Upload, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function LabAttendantPortal() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [patientHealthId, setPatientHealthId] = useState('')
  const [testName, setTestName] = useState('')
  const [testType, setTestType] = useState('')
  const [resultSummary, setResultSummary] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !patientHealthId || !testName) {
      setMessage('Please fill all required fields')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      // Find patient by health ID
      const { data: patients, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('health_id', patientHealthId)
        .maybeSingle()

      if (patientError || !patients) {
        setMessage('Patient not found with this Health ID')
        setUploading(false)
        return
      }

      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string

          // Upload via edge function
          const { data, error } = await supabase.functions.invoke('lab-report-upload', {
            body: {
              fileData: base64Data,
              fileName: file.name,
              patientId: patients.id,
              testName,
              testType,
              resultSummary,
              hospitalId: profile?.hospital_id,
              labName: 'Hospital Laboratory'
            }
          })

          if (error) throw error

          setMessage('Lab report uploaded successfully!')
          setFile(null)
          setPatientHealthId('')
          setTestName('')
          setTestType('')
          setResultSummary('')
        } catch (error: any) {
          console.error('Upload error:', error)
          setMessage('Upload failed: ' + error.message)
        } finally {
          setUploading(false)
        }
      }

      reader.readAsDataURL(file)
    } catch (error: any) {
      setMessage('Error: ' + error.message)
      setUploading(false)
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
            <h1 className="text-2xl font-bold text-purple-600">MedAssist - Lab Attendant Portal</h1>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="text-purple-600" size={28} />
            <h2 className="text-2xl font-bold text-gray-900">Upload Lab Report</h2>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Health ID *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={patientHealthId}
                  onChange={(e) => setPatientHealthId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter patient's Health ID"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Name *
                </label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Complete Blood Count"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Type
                </label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select type</option>
                  <option value="Blood Test">Blood Test</option>
                  <option value="Urine Test">Urine Test</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="MRI">MRI</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="Ultrasound">Ultrasound</option>
                  <option value="ECG">ECG</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result Summary
              </label>
              <textarea
                value={resultSummary}
                onChange={(e) => setResultSummary(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Brief summary of test results..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lab Report File * (PDF or Image)
              </label>
              <input
                type="file"
                required
                accept=".pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Lab Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
