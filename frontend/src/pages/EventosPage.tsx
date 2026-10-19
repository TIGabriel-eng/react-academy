import { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { EventoModal } from '../components/EventoModal';
import { parseEventoData, diasRestantes, formatMesAbrev, fimEvento, formatDataHora } from '../utils/evento';
import type { Evento } from '../types';

export function EventosPage() {
  const [vigentes, setVigentes] = useState<Evento[]>([]);
  const [realizados, setRealizados] = useState<Evento[]>([]);
  const [selected, setSelected] = useState<Evento | null>(null);
  const [marcandoLido, setMarcandoLido] = useState(false);
  const [marcadoLido, setMarcadoLido] = useState(false);

  useEffect(() => {
    ApiService.getEventos()
      .then((data) => {
        const ev = (data || []) as Evento[];
        const now = new Date();
        const inicio = (e: Evento) => parseEventoData(e.data)?.getTime() || 0;
        const validos = ev.filter((e) => parseEventoData(e.data));
        const fim = (e: Evento) => fimEvento(e, parseEventoData(e.data)!);
        setVigentes(validos.filter((e) => fim(e) > now).sort((a, b) => inicio(a) - inicio(b)));
        setRealizados(validos.filter((e) => fim(e) <= now).sort((a, b) => inicio(b) - inicio(a)));
      })
      .catch(() => {});
  }, []);

  const handleMarcarLido = () => {
    if (!selected || marcandoLido || marcadoLido) return;
    setMarcandoLido(true);
    ApiService.marcarEventoLido(selected.id)
      .then(() => setMarcadoLido(true))
      .catch(() => {})
      .finally(() => setMarcandoLido(false));
  };

  const renderCard = (ev: Evento, realizado: boolean) => {
    const d = parseEventoData(ev.data);
    if (!d) return null;
    const mes = formatMesAbrev(d);
    const dia = d.getDate();
    const fim = fimEvento(ev, d);
    const agora = new Date();
    const emAndamento = !realizado && d <= agora;
    const dias = diasRestantes(d);
    const cor = realizado ? '148, 163, 184' : emAndamento ? '34, 197, 94' : '59, 130, 246';
    const corTexto = realizado ? '#94a3b8' : emAndamento ? '#4ade80' : '#60a5fa';
    return (
      <div
        key={ev.id}
        onClick={() => { setSelected(ev); setMarcadoLido(false); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          maxWidth: '900px',
          minHeight: '83px',
          padding: '16px',
          background: `rgba(${cor}, 0.08)`,
          border: `1px solid rgba(${cor}, 0.2)`,
          borderRadius: 'var(--radius-lg)',
          cursor: 'pointer',
          opacity: realizado ? 0.85 : 1,
          transition: 'background 0.2s, border-color 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `rgba(${cor}, 0.15)`; e.currentTarget.style.borderColor = `rgba(${cor}, 0.4)`; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = `rgba(${cor}, 0.08)`; e.currentTarget.style.borderColor = `rgba(${cor}, 0.2)`; }}
      >
        <div className="events-list__date" style={{ background: `rgba(${cor}, 0.15)` }}>
          <span className="events-list__month" style={{ color: corTexto }}>{mes}</span>
          <span className="events-list__day">{dia}</span>
        </div>
        <div className="events-list__info">
          <div className="events-list__title" style={{ fontSize: '1rem', fontWeight: 600 }}>{ev.titulo || 'Evento'}</div>
          <div className="events-list__time">
            {realizado || emAndamento ? `Início: ${formatDataHora(d)} · Término: ${formatDataHora(fim)}` : `Início: ${formatDataHora(d)}`}
          </div>
        </div>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          color: corTexto,
          background: `rgba(${cor}, 0.12)`,
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {realizado ? 'Realizado' : emAndamento ? 'Em andamento' : `em ${dias} ${dias === 1 ? 'dia' : 'dias'}`}
        </span>
        <i className="ti ti-chevron-right events-list__arrow" style={{ color: corTexto }}></i>
      </div>
    );
  };

  const h2 = { fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, margin: '24px 0 12px', color: '#94a3b8' } as const;
  const lista = { display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '900px' } as const;

  return (
    <div style={{ padding: '12px 24px' }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: '1.3125rem', fontWeight: 800, marginBottom: '16px', color: '#ff9d00' }}>Eventos</h1>
      {vigentes.length === 0 ? (
        <div className="events-empty" style={{ textAlign: 'center', padding: '40px 0' }}>
          <i className="ti ti-calendar-off" style={{ fontSize: '2rem', marginBottom: '8px', display: 'block' }}></i>
          <p>Nenhum evento vigente</p>
        </div>
      ) : (
        <div style={lista}>{vigentes.map((ev) => renderCard(ev, false))}</div>
      )}

      {realizados.length > 0 && (
        <>
          <h2 style={h2}>Eventos realizados</h2>
          <div style={lista}>{realizados.map((ev) => renderCard(ev, true))}</div>
        </>
      )}

      {selected && (
        <EventoModal
          evento={selected}
          onClose={() => setSelected(null)}
          onMarcarLido={handleMarcarLido}
          marcandoLido={marcandoLido}
          marcadoLido={marcadoLido}
        />
      )}
    </div>
  );
}
