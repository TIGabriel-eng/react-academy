import { useState } from 'react';
import type { Curso } from '../../types';

interface LessonInfoProps {
  curso: Curso;
  tituloAula: string;
  moduloTitulo?: string;
  aulaIndex?: number;
  moduloId?: number;
}

export function LessonInfo({ curso, tituloAula, moduloTitulo, aulaIndex }: LessonInfoProps) {
  const [descExpanded, setDescExpanded] = useState(false);

  return (
    <div className="va-lesson-info">
      <h1 className="va-lesson-info__title">{tituloAula}</h1>
      <div className="va-lesson-info__meta">
        {moduloTitulo && (
          <span className="va-lesson-info__modulo">
            {moduloTitulo}
            {aulaIndex !== undefined && (' · Aula ' + (aulaIndex + 1))}
          </span>
        )}
        {curso.tipo && (
          <span className="va-lesson-info__badge">
            <i className={curso.tipo === 'video' ? 'fa-solid fa-video' : 'fa-solid fa-book'} />
            {curso.tipo === 'video' ? 'Vídeo' : 'Curso'}
          </span>
        )}
      </div>
      <p className="va-lesson-info__curso-title">
        <a href={'/curso/' + (curso.slug || curso.id)} className="va-link">
          <i className="fa-solid fa-arrow-left" /> {curso.titulo}
        </a>
      </p>
      {curso.descricao && (
        <div className="va-lesson-info__desc-wrap">
          <p className={'va-lesson-info__desc' + (descExpanded ? ' expanded' : '')}>
            {curso.descricao}
          </p>
          {curso.descricao.length > 150 && (
            <button
              className="va-lesson-info__desc-toggle"
              onClick={() => setDescExpanded(!descExpanded)}
            >
              {descExpanded ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
