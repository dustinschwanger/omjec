'use client'

import { useState, useRef, useEffect } from 'react'
import { useChatContext } from '@/contexts/ChatContext'
import ReactMarkdown from 'react-markdown'
import styles from './ChatWidget.module.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function ChatWidget() {
  const { sessionToken, isOpen, setIsOpen } = useChatContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Load chat history when widget opens
    if (isOpen && sessionToken && messages.length === 0) {
      loadChatHistory()
    }
  }, [isOpen, sessionToken])

  const loadChatHistory = async () => {
    if (!sessionToken) return

    try {
      const response = await fetch(`/api/chat/history?sessionToken=${sessionToken}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error('Error loading chat history:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !sessionToken || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
      },
    ])

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionToken,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let streamedContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  streamedContent += data.content
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: streamedContent }
                        : msg
                    )
                  )
                }
                if (data.done) {
                  break
                }
              } catch (err) {
                console.error('Error parsing SSE data:', err)
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: 'Sorry, I encountered an error. Please try again.',
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${styles.floatingButton} ${isOpen ? styles.open : ''}`}
        aria-label="Chat Assistant"
      >
        {isOpen ? (
          <i className="fas fa-times"></i>
        ) : (
          <i className="fas fa-comment-dots"></i>
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className={styles.chatWidget}>
          <div className={styles.chatHeader}>
            <div className={styles.headerContent}>
              <i className="fas fa-robot"></i>
              <div>
                <h3>OhioMeansJobs Assistant</h3>
                <p>Ask me anything about our services</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
              aria-label="Close chat"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className={styles.chatMessages}>
            {messages.length === 0 && (
              <div className={styles.welcomeMessage}>
                <i className="fas fa-robot"></i>
                <h4>Welcome to OhioMeansJobs Erie County!</h4>
                <p>I can help you with:</p>
                <ul>
                  <li>Job seeker services and resources</li>
                  <li>Employer services and hiring support</li>
                  <li>Youth programs and L.Y.F.E. information</li>
                  <li>Upcoming events and workshops</li>
                  <li>Contact information and hours</li>
                </ul>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.role === 'user' ? styles.userMessage : styles.assistantMessage
                }`}
              >
                <div className={styles.messageIcon}>
                  {message.role === 'user' ? (
                    <i className="fas fa-user"></i>
                  ) : (
                    <i className="fas fa-robot"></i>
                  )}
                </div>
                <div className={styles.messageContent}>
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={props.children?.toString().includes('📄') ? styles.downloadLink : ''}
                          />
                        )
                      }}
                    >
                      {message.content || '...'}
                    </ReactMarkdown>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className={styles.chatInput}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
