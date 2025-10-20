'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'

interface ChatContextType {
  sessionToken: string | null
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Initialize session on mount
    initializeSession()
  }, [])

  const initializeSession = async () => {
    // Check for existing session in localStorage
    let token = localStorage.getItem('chat_session_token')

    if (!token) {
      // Generate new session token
      token = uuidv4()
      localStorage.setItem('chat_session_token', token)
      console.log('Generated new session token:', token)
    } else {
      console.log('Using existing session token:', token)
    }

    setSessionToken(token)

    // Note: The session will be created in the database by the API routes
    // when the first message is sent or history is loaded
  }

  return (
    <ChatContext.Provider value={{ sessionToken, isOpen, setIsOpen }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
