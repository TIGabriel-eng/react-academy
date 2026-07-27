import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import type { Curso } from '../types';

export function CursoPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [curso, setCurso] = useState<Curso | null>(null);

  useEffect(() => {
    if (!slug) return;
    ApiService.getCursos().then((data) => {
      const found = (data || []).find((c: Curso) => (c.slug || String(c.id)) === slug);
      setCurso(found || null);
    }).catch(() => {});
  }, [slug]);

  if (!curso) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Curso não encontrado</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', marginBottom: '16px' }}>
        ← Voltar
      </button>
      <img src={curso.thumbnail_url || ''} alt={curso.titulo} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '16px' }} />
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>{curso.titulo}</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>{curso.descricao || ''}</p>
      <span className={'course-card__badge badge--' + (curso.status === 'publicado' ? 'em-andamento' : 'pendente')} style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
        {curso.status === 'publicado' ? 'Publicado' : curso.status || 'Indefinido'}
      </span>
    </div>
  );
}