import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, UserProfile } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          await loadProfile(user.id)
        }
      } finally {
        setLoading(false)
      }
    }
    loadUser()

    // Set up auth listener - keep simple, no async operations
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        if (session?.user) {
          loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: error as Error }
    }
  }

  async function signUp(email: string, password: string, userData: Partial<UserProfile>) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('User creation failed')

      // Create user profile (DO NOT store password here)
      const profileData = {
        user_id: authData.user.id,
        email: email,
        full_name: userData.full_name || '',
        role: userData.role || 'patient',
        contact_number: userData.contact_number || '',
        license_number: userData.license_number || '',
        verified: false
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([profileData])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw profileError
      }

      // If role is patient, create patient record
      if (userData.role === 'patient') {
        const { error: patientError } = await supabase
          .from('patients')
          .insert([{
            user_id: authData.user.id,
            health_id: `MED${Date.now()}`,
            full_name: userData.full_name || '',
            date_of_birth: '2000-01-01', // Placeholder, should be collected during signup
            contact_number: userData.contact_number,
            email: email
          }])

        if (patientError) {
          console.error('Patient creation error:', patientError)
          // Continue even if patient creation fails
        }
      }

      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: error as Error }
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
