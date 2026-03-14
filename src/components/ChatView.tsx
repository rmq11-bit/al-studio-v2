'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface Message {
  id: string
  body: string
  createdAt: string
  sender: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

interface Props {
  conversationId: string
  currentUserId: string
  currentUserName: string
}

export default function ChatView({ conversationId, currentUserId, currentUserName }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/conversations/${conversationId}/messages`)
    if (res.ok) {
      const data = await res.json()
      setMessages(data)
    }
    setLoading(false)
  }, [conversationId])

  // Initial load
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const trimmed = body.trim()
    if (!trimmed || sending) return

    setSending(true)

    // Optimistic update
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      body: trimmed,
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId, name: currentUserName, avatarUrl: null },
    }
    setMessages((prev) => [...prev, optimistic])
    setBody('')

    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: trimmed }),
    })

    setSending(false)

    if (res.ok) {
      // Replace optimistic message with real one from server
      const real = await res.json()
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? real : m))
      )
    } else {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-[#C0A4A3] animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            لا توجد رسائل بعد — ابدأ المحادثة
          </p>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUserId
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {!isMe && (
                msg.sender.avatarUrl ? (
                  <img
                    src={msg.sender.avatarUrl}
                    alt={msg.sender.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#C0A4A3] flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1">
                    {msg.sender.name[0]}
                  </div>
                )
              )}

              {/* Bubble */}
              <div
                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-[#C0A4A3] text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                }`}
              >
                {msg.body}
                <div
                  className={`text-[10px] mt-1 ${
                    isMe ? 'text-white/70 text-left' : 'text-gray-400 text-right'
                  }`}
                  dir="ltr"
                >
                  {new Date(msg.createdAt).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-3 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="اكتب رسالة... (Enter للإرسال، Shift+Enter لسطر جديد)"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0A4A3] focus:ring-2 focus:ring-[#C0A4A3]/20 transition-all resize-none max-h-28 overflow-y-auto"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = `${Math.min(el.scrollHeight, 112)}px`
            }}
          />
          <button
            onClick={handleSend}
            disabled={!body.trim() || sending}
            className="w-10 h-10 bg-[#C0A4A3] text-white rounded-xl flex items-center justify-center hover:bg-[#A88887] transition-colors disabled:opacity-50 shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
