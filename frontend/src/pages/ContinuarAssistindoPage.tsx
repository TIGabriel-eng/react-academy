import { useEffect, useState, useMemo } from 'react';
import { ApiService } from '../services/api';
import { ProgressService } from '../services/progress';
import { agruparCursosPorAcademia, ACADEMY_EXCLUSAO } from '../types';
import type { Curso } from '../types';
import { AcademySection } from '../components/AcademySection';
import cursoNaoConcluidoImg from '../assets/images/curso-não-concluído.png';

interface ProgressoMap {
  [cursoId: string]: { progresso: number; concluido: boolean };
}

export function ContinuarAssistindoPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [progressoMap, setProgressoMap] = useState<ProgressoMap>({});

  useEffect(() => {
    ApiService.getCursos().then((data) => setCursos(data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!cursos.length) return;
    ProgressService.getMapProgressos(cursos)
      .then((mapa) => {
        const novoMapa: ProgressoMap = {};
        Object.entries(mapa).forEach(([id, p]) => {
          novoMapa[id] = { progresso: p?.progresso || 0, concluido: !!p?.concluido };
        });
        setProgressoMap(novoMapa);
      })
      .catch(() => {});
  }, [cursos]);

  const emAndamento = useMemo(() => {
    return cursos.filter((c) => {
      if (ACADEMY_EXCLUSAO.includes(c.ambiente_nome || '')) return false;
      const p = progressoMap[String(c.id)];
      return p && !p.concluido && p.progresso > 0 && p.progresso < 100;
    });
  }, [cursos, progressoMap]);

  const grupos = useMemo(() => agruparCursosPorAcademia(emAndamento), [emAndamento]);
  const temCursos = Object.values(grupos).some((g) => g.length > 0);

  return (
    <div style={{ padding: '12px 24px' }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: '1.3125rem', fontWeight: 800, marginBottom: '16px', color: '#ff9d00' }}>Continuar Assistindo</h1>
      {!temCursos ? (
        <div style={{ textAlign: 'center', padding: '40px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <img src={cursoNaoConcluidoImg} alt="Nenhum curso em andamento" style={{ maxWidth: '160px', marginBottom: '10px' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Você não tem nenhum curso em andamento!</p>
        </div>
      ) : (
        Object.entries(grupos).map(([academia, cursosDaAcademia]) => (
          <AcademySection
            key={academia}
            academyName={academia}
            cursos={cursosDaAcademia}
            getCursoStatus={(c) => {
              const p = progressoMap[String(c.id)];
              return {
                label: `Em andamento \u00b7 ${p?.progresso || 0}%`,
                className: 'status-em-andamento',
              };
            }}
          />
        ))
      )}
    </div>
  );
}
