import { useNavigate } from 'react-router-dom';
import type { Curso } from '../types';

interface AcademySectionProps {
  academyName: string;
  cursos: Curso[];
  getCursoStatus?: (curso: Curso) => { label: string; className: string };
  extraContent?: (curso: Curso) => React.ReactNode;
}

export function AcademySection({ academyName, cursos, getCursoStatus, extraContent }: AcademySectionProps) {
  const navigate = useNavigate();

  if (!cursos.length) return null;

  const defaultStatus = (_c: Curso) => ({ label: 'Não-Iniciado', className: 'status-nao-iniciado' });

  return (
    <section style={{ marginBottom: '32px' }}>
      <div className="section-header">
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--color-text-secondary)',
          background: 'rgba(255,255,255,.05)',
          padding: '8px 16px',
          borderRadius: '8px',
          display: 'inline-block',
        }}>
          <i className="fa-solid fa-building" style={{ marginRight: '8px', color: 'var(--color-accent)' }}></i>
          {academyName}
        </h2>
      </div>
      <div className="cursos-grid">
        {cursos.map((curso) => {
          const slug = curso.slug || String(curso.id);
          const thumbSrc = curso.thumbnail_url || '';
          const status = (getCursoStatus || defaultStatus)(curso);
          return (
            <div key={curso.id} className="curso-card" onClick={() => navigate('/video-area/' + slug)}>
              <div className="curso-card__image">
                <img src={thumbSrc} alt={curso.titulo} loading="lazy" />
                <span className={`curso-card__status ${status.className}`}>{status.label}</span>
              </div>
              <div className="curso-card__name">{curso.titulo}</div>
              <div className="curso-card__divider"></div>
              <div className="curso-card__meta">
                <span><i className="fa-solid fa-book"></i> Curso</span>
                <span><i className="fa-solid fa-award"></i> Certificado</span>
              </div>
              {extraContent && (
                <div style={{ padding: '0 12px 12px' }}>
                  {extraContent(curso)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
