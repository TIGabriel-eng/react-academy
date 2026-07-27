import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import type { Curso } from '../types';
import cursoNaoConcluidoImg from '../assets/images/curso-não-concluído.png';

export function CursosConcluidosPage() {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [matriculas, setMatriculas] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([ApiService.getCursos(), ApiService.getMinhasMatriculas()])
      .then(([cursosData, matriculasData]) => {
        setCursos(cursosData || []);
        setMatriculas(matriculasData || []);
      })
      .catch(() => {});
  }, []);

  const concluidos = cursos.filter((c) => {
    const mat = matriculas.find((m) => m.curso === c.id);
    return mat?.concluido;
  });

  return (
    <div style={{ padding: '12px 24px' }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: '1.3125rem', fontWeight: 800, marginBottom: '16px', color: '#ff9d00' }}>Cursos Concluídos</h1>
      {concluidos.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 12px' }}>
          <img src={cursoNaoConcluidoImg} alt="Nenhum curso concluído" style={{ maxWidth: '70px', marginBottom: '16px' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', fontWeight: 600, textAlign: 'center' }}>Você ainda não concluiu nenhum curso!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {concluidos.map((c) => {
            const slug = c.slug || c.id;
            return (
              <div key={c.id} className="course-card" onClick={() => navigate('/curso/' + slug)}>
                <img src={c.thumbnail_url || ''} alt={c.titulo} className="curso-capa" />
                <div className="course-card__body">
                  <h3>{c.titulo}</h3>
                  <span className="course-card__badge badge--concluido">Concluído</span>
                </div>
                <div className="course-card__progress">
                  <div className="progress__bar-track"><div className="progress__bar-fill" style={{ width: '100%' }}></div></div>
                  <span>100%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}