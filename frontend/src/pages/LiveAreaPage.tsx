import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import type { Live } from '../types';

function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

interface ChatMessage {
  id: number;
  user: string;
  text: string;
  time: string;
}

export function LiveAreaPage() {
  const { liveId } = useParams<{ liveId: string }>();
  const navigate = useNavigate();

  const [live, setLive] = useState<Live | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!liveId) return;
    setLoading(true);
    setError(null);
    ApiService.getLive(parseInt(liveId))
      .then((data: any) => {
        setLive(data);
        document.title = data.titulo + ' | Orcoma Academy';
      })
      .catch(() => setError('Não foi possível carregar a live.'))
      .finally(() => setLoading(false));
  }, [liveId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const msg: ChatMessage = {
      id: Date.now(),
      user: 'Você',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
    setChatInput('');
  };

  if (loading) {
    return (
      <div className="va-page">
        <div className="va-skeleton">
          <div className="va-skeleton__video" />
          <div className="va-skeleton__lines">
            <div className="va-skeleton__line w80" />
            <div className="va-skeleton__line w60" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !live) {
    return (
      <div className="va-page">
        <div className="va-error">
          <i className="fa-solid fa-exclamation-triangle" style={{ fontSize: '2rem', color: '#ef4444', marginBottom: '12px' }} />
          <h2>{error || 'Live não encontrada'}</h2>
          <button className="va-btn-accent" onClick={() => navigate(-1)}>
            <i className="fa-solid fa-arrow-left" /> Voltar
          </button>
        </div>
      </div>
    );
  }

  const videoId = getYouTubeVideoId(live.url_externa);
  const dataStr = live.data_hora;
  const parts = dataStr.split(' ');
  const dp = parts[0]?.split('/') || [];
  const tp = parts[1]?.split(':') || [];
  const d = new Date(parseInt(dp[2] || '2024'), parseInt(dp[1] || '1') - 1, parseInt(dp[0] || '1'), parseInt(tp[0] || '0'), parseInt(tp[1] || '0'));
  const mes = meses[d.getMonth()];
  const dia = d.getDate();
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="va-page">
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          margin: '12px 24px 0',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.85rem',
        }}
      >
        <i className="fa-solid fa-arrow-left" /> Voltar
      </button>

      <div style={{ padding: '12px 24px 24px' }}>
        <div
          style={{
            background: live.status === 'ao_vivo'
              ? 'linear-gradient(135deg, #dc2626, #ef4444)'
              : live.status === 'agendada'
                ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                : 'linear-gradient(135deg, #6b7280, #9ca3af)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '0.8rem',
            marginBottom: '16px',
            animation: live.status === 'ao_vivo' ? 'pulse 2s infinite' : 'none',
          }}
        >
          {live.status === 'ao_vivo' && '🔴 AO VIVO'}
          {live.status === 'agendada' && '📅 AGENDADA'}
          {live.status === 'encerrada' && '📁 ENCERRADA'}
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 640px', minWidth: 0 }}>
            {videoId ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: '#000' }}>
                <iframe
                  src={'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0'}
                  title={live.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            ) : (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: '#000' }}>
                <iframe
                  src={live.url_externa}
                  title={live.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            )}

            <div style={{ marginTop: '16px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
                {live.titulo}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                {live.status !== 'ao_vivo' && (
                  <span><i className="fa-regular fa-calendar" style={{ marginRight: '4px' }} />{dia} {mes} • {hora}</span>
                )}
                {live.ambiente_nome && (
                  <span><i className="fa-solid fa-building" style={{ marginRight: '4px' }} />{live.ambiente_nome}</span>
                )}
                {live.is_gratuito && (
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>Gratuito</span>
                )}
              </div>
              {live.descricao && (
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.9rem', maxWidth: '700px' }}>
                  {live.descricao}
                </p>
              )}
            </div>
          </div>

          <div style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 200px)',
              minHeight: '400px',
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border)',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <i className="fa-regular fa-comment-dots" style={{ color: 'var(--color-accent)' }} />
                Chat ao vivo
              </div>

              <div ref={chatRef} style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', padding: '40px 0' }}>
                    Nenhuma mensagem ainda. Seja o primeiro a comentar!
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} style={{
                    padding: '8px 12px',
                    background: 'rgba(59, 130, 246, 0.08)',
                    borderRadius: 'var(--radius-lg)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-accent)' }}>{msg.user}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{msg.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text)' }}>{msg.text}</p>
                  </div>
                ))}
              </div>

              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                gap: '8px',
              }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  placeholder="Digite sua mensagem..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--color-text)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, var(--color-accent-2), #2563eb)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <i className="fa-solid fa-paper-plane" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
