"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react';

const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#00b894', '#e17055', '#0984e3'];
const getUserColor = (id: string) => COLORS[id.charCodeAt(0) % COLORS.length];

export default function ChatWidget({ currentUserId }: { currentUserId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFetchRef = useRef<string | null>(null);

  // Carica messaggi iniziali
  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        if (data.length > 0) {
          lastFetchRef.current = data[data.length - 1].createdAt;
        }
      }
    } catch { /* silent */ }
  }, []);

  // Polling per nuovi messaggi
  const pollMessages = useCallback(async () => {
    if (!lastFetchRef.current) return;
    try {
      const res = await fetch(`/api/chat?after=${encodeURIComponent(lastFetchRef.current)}`);
      if (res.ok) {
        const newMsgs = await res.json();
        if (newMsgs.length > 0) {
          setMessages(prev => [...prev, ...newMsgs]);
          lastFetchRef.current = newMsgs[newMsgs.length - 1].createdAt;
          
          // Se la chat è chiusa, incrementa il counter
          if (!isOpen) {
            setUnreadCount(prev => prev + newMsgs.filter((m: any) => m.authorId !== currentUserId).length);
          }
        }
      }
    } catch { /* silent */ }
  }, [isOpen, currentUserId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const interval = setInterval(pollMessages, 5000);
    return () => clearInterval(interval);
  }, [pollMessages]);

  // Auto-scroll quando ci sono nuovi messaggi
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Reset unread + blocca scroll pagina sotto + fix tastiera mobile
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);

      // Blocca lo scroll della pagina sottostante
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      // Fix tastiera mobile: adatta il pannello chat al viewport visibile
      const vv = window.visualViewport;
      const handleViewportResize = () => {
        const panel = document.querySelector('.chat-panel') as HTMLElement;
        if (!panel || !vv) return;
        panel.style.height = `${vv.height}px`;
        panel.style.top = `${vv.offsetTop}px`;
      };

      if (vv) {
        vv.addEventListener('resize', handleViewportResize);
        vv.addEventListener('scroll', handleViewportResize);
        handleViewportResize();
      }

      return () => {
        // Ripristina lo scroll della pagina
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);

        if (vv) {
          vv.removeEventListener('resize', handleViewportResize);
          vv.removeEventListener('scroll', handleViewportResize);
        }
      };
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() })
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        lastFetchRef.current = msg.createdAt;
        setNewMessage('');
      }
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    return `${d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })} ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <>
      {/* Pulsante flottante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isOpen ? 'var(--danger)' : 'linear-gradient(135deg, var(--primary), #ff3036)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(255, 90, 95, 0.5)',
          zIndex: 1000,
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        
        {/* Badge non letti */}
        {!isOpen && unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ff3b30',
            color: 'white',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 700,
            border: '2px solid var(--background)',
            animation: 'pulse 2s infinite',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Pannello chat */}
      <div className="chat-panel" style={{
        position: 'fixed',
        bottom: isOpen ? '5.5rem' : '-600px',
        right: '1.5rem',
        width: 'min(380px, calc(100vw - 2rem))',
        height: 'min(520px, calc(100vh - 8rem))',
        background: 'rgba(22, 25, 32, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 999,
        transition: 'bottom 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        
        {/* Header */}
        <div style={{
          padding: '1rem 1.2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary), #ff3036)',
              borderRadius: '10px',
              padding: '0.4rem',
              display: 'flex',
            }}>
              <MessageCircle size={18} color="white" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Chat Team</h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{messages.length} messaggi</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem' }}
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Corpo messaggi */}
        <div 
          ref={chatBodyRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '3rem' }}>
              <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p>Nessun messaggio ancora.<br/>Inizia la conversazione!</p>
            </div>
          )}
          
          {messages.map((msg, i) => {
            const isMe = msg.authorId === currentUserId;
            const showAvatar = i === 0 || messages[i - 1]?.authorId !== msg.authorId;
            const color = getUserColor(msg.authorId);
            
            return (
              <div key={msg.id} style={{ 
                display: 'flex', 
                flexDirection: isMe ? 'row-reverse' : 'row',
                gap: '0.5rem',
                alignItems: 'flex-end',
              }}>
                {/* Avatar */}
                {!isMe && showAvatar ? (
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: `${color}30`, color: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {msg.author?.nome?.[0]}{msg.author?.cognome?.[0]}
                  </div>
                ) : !isMe ? (
                  <div style={{ width: '30px', flexShrink: 0 }} />
                ) : null}
                
                <div style={{ maxWidth: '75%' }}>
                  {/* Nome (solo primo messaggio del gruppo) */}
                  {showAvatar && !isMe && (
                    <span style={{ 
                      fontSize: '0.7rem', fontWeight: 600, color: color, 
                      marginLeft: '0.3rem', marginBottom: '0.15rem', display: 'block' 
                    }}>
                      {msg.author?.nome} {msg.author?.cognome}
                    </span>
                  )}
                  
                  {/* Bolla messaggio */}
                  <div style={{
                    padding: '0.6rem 0.9rem',
                    borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: isMe 
                      ? 'linear-gradient(135deg, var(--primary), #ff3036)' 
                      : 'rgba(255,255,255,0.08)',
                    color: isMe ? 'white' : 'var(--text-main)',
                    fontSize: '0.88rem',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                  </div>
                  
                  {/* Ora */}
                  <span style={{ 
                    fontSize: '0.6rem', color: 'var(--text-muted)', 
                    marginTop: '0.15rem', display: 'block',
                    textAlign: isMe ? 'right' : 'left',
                    paddingLeft: isMe ? 0 : '0.3rem',
                    paddingRight: isMe ? '0.3rem' : 0,
                  }}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '0.8rem 1rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <input
            ref={inputRef}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi un messaggio..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '0.6rem 1rem',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              fontFamily: 'Outfit, sans-serif',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: newMessage.trim() ? 'linear-gradient(135deg, var(--primary), #ff3036)' : 'rgba(255,255,255,0.06)',
              border: 'none',
              color: newMessage.trim() ? 'white' : 'var(--text-muted)',
              cursor: newMessage.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Pulse animation keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </>
  );
}
