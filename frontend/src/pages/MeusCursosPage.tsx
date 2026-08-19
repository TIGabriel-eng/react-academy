import { useEffect, useState, useMemo } from 'react';
import { ApiService } from '../services/api';
import { agruparCursosPorAcademia } from '../types';
import type { Curso } from '../types';
import { AcademySection } from '../components/AcademySection';
import nenhumCursoImg from '../assets/images/nenhum-curso.png';

export function MeusCursosPage() {
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

  const grupos = useMemo(() => agruparCursosPorAcademia(cursos), [cursos]);
  const temCursos = Object.values(grupos).some((g) => g.length > 0);

  const getMatricula = (cursoId: number) => matriculas.find((m) => m.curso === cursoId);

  const getCursoStatus = (curso: Curso) => {
    const mat = getMatricula(curso.id);
    const progresso = mat?.progresso || 0;
    if (mat?.concluido) return { label: 'Concluído', className: 'status-concluido' };
    if (mat && progresso > 0) return { label: 'Andamento', className: 'status-em-andamento' };
    return { label: 'Não-Iniciado', className: 'status-nao-iniciado' };
  };

  return (
    <div style={{ padding: '12px 24px' }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: '1.3125rem', fontWeight: 800, marginBottom: '16px', color: '#ff9d00' }}>Meus Cursos</h1>
      {!temCursos ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 12px' }}>
          <img src={nenhumCursoImg} alt="Nenhum curso" style={{ maxWidth: '70px', marginBottom: '16px' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', fontWeight: 600, textAlign: 'center' }}>Nenhum curso disponível!</p>
        </div>
      ) : (
        Object.entries(grupos).map(([academia, cursosDaAcademia]) => (
          <AcademySection
            key={academia}
            academyName={academia}
            cursos={cursosDaAcademia}
            getCursoStatus={getCursoStatus}
          />
        ))
      )}
    </div>
  );
}
