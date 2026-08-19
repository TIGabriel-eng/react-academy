import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import { agruparCursosPorAcademia } from '../types';
import type { Curso } from '../types';
import { AcademySection } from '../components/AcademySection';
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

  const concluidos = useMemo(() => {
    return cursos.filter((c) => {
      const mat = matriculas.find((m) => m.curso === c.id);
      return mat?.concluido;
    });
  }, [cursos, matriculas]);

  const grupos = useMemo(() => agruparCursosPorAcademia(concluidos), [concluidos]);
  const temCursos = Object.values(grupos).some((g) => g.length > 0);

  return (
    <div style={{ padding: '12px 24px' }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: '1.3125rem', fontWeight: 800, marginBottom: '16px', color: '#ff9d00' }}>Cursos Concluídos</h1>
      {!temCursos ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 12px' }}>
          <img src={cursoNaoConcluidoImg} alt="Nenhum curso concluído" style={{ maxWidth: '160px', marginBottom: '16px' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', fontWeight: 600, textAlign: 'center' }}>Você ainda não concluiu nenhum curso!</p>
        </div>
      ) : (
        Object.entries(grupos).map(([academia, cursosDaAcademia]) => (
          <AcademySection
            key={academia}
            academyName={academia}
            cursos={cursosDaAcademia}
            getCursoStatus={() => ({ label: 'Concluído', className: 'status-concluido' })}
            extraContent={(_curso) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span className="concluido-badge">Concluído</span>
                <span className="certificado-link" onClick={(e) => { e.stopPropagation(); navigate('/certificados'); }}>
                  <i className="fa-solid fa-file-pdf"></i> Certificado
                </span>
              </div>
            )}
          />
        ))
      )}
    </div>
  );
}
