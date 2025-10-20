'use client'

import { ChatProvider } from '@/contexts/ChatContext'
import { AuthProvider } from '@/contexts/AuthContext'
import ChatWidget from './ChatWidget/ChatWidget'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ChatProvider>
        {children}
        <ChatWidget />
      </ChatProvider>
    </AuthProvider>
  )
}
