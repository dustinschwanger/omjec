'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check active sessions and sets the user
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkAdminStatus(session.user.id)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      await checkAdminStatus(user.id)
    }
    setLoading(false)
  }

  async function checkAdminStatus(userId: string) {
    console.log('Checking admin status for user:', userId)
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_id', userId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error checking admin status:', error)
    }

    console.log('Admin user data:', adminUser)
    setIsAdmin(!!adminUser)
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    router.push('/admin/login')
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut }}>
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
