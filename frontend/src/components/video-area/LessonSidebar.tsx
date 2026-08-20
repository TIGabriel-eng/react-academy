import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth';
import { ACADEMIES } from '../../types';
import type { Modulo, Material } from '../../types';
import logoImage from '../../assets/images/LOGO ORCOMA ACADEMY.png';

interface LessonSidebarProps {
  cursoTitulo: string;
  modulos: Modulo[];
  moduloAtualIdx: number;
  aulaAtualIdx: number;
  onSelectAula: (moduloIdx: number, aulaIdx: number, material: Material) => void;
  progressoGeral?: number;
  completedLessons?: Set<string>;
}

interface SidebarItem {
  material: Material;
  originalIdx: number;
}

function isVideoMaterial(m: Material): boolean {
  return m.modalidade === 'video' || !!(m.url_externa && !m.modalidade);
}

function getLessonInfo(modalidade?: string): { icon: string; label: string; typeClass: string } {
  switch (modalidade) {
    case 'video': return { icon: 'fa-solid fa-circle-play', label: 'VÍDEO', typeClass: 'video' };
    case 'pdf':   return { icon: 'fa-solid fa-file-pdf', label: 'PDF', typeClass: 'pdf' };
    case 'xls':
    case 'xlsx':  return { icon: 'fa-solid fa-file-excel', label: 'PLANILHA', typeClass: 'xls' };
    case 'zip':   return { icon: 'fa-solid fa-file-zipper', label: 'ARQUIVO', typeClass: 'zip' };
    case 'link':  return { icon: 'fa-solid fa-link', label: 'LINK', typeClass: 'link' };
    default: {
      if (isVideoMaterial({ modalidade } as Material)) {
        return { icon: 'fa-solid fa-circle-play', label: 'VÍDEO', typeClass: 'video' };
      }
      return { icon: 'fa-solid fa-file', label: 'ARQUIVO', typeClass: 'default' };
    }
  }
}

function sortMaterials(materials: Material[]): SidebarItem[] {
  const items: SidebarItem[] = materials.map((m, i) => ({ material: m, originalIdx: i }));
  return items.sort((a, b) => {
    const aIsVideo = isVideoMaterial(a.material) ? 0 : 1;
    const bIsVideo = isVideoMaterial(b.material) ? 0 : 1;
    if (aIsVideo !== bIsVideo) return aIsVideo - bIsVideo;
    return a.originalIdx - b.originalIdx;
  });
}

export function LessonSidebar({
  cursoTitulo,
  modulos,
  moduloAtualIdx,
  aulaAtualIdx,
  onSelectAula,
  progressoGeral = 0,
  completedLessons = new Set(),
}: LessonSidebarProps) {
  const navigate = useNavigate();
  const totalAulas = modulos.reduce(
    (acc, m) => acc + (m.materiais?.filter(isVideoMaterial).length || 0), 0
  );
  const concluidas = completedLessons.size;

  const handleLogoClick = () => {
    const academyKey = AuthService.getCurrentAcademy();
    const academy = ACADEMIES[academyKey];
    navigate(academy?.path || '/team');
  };

  return (
    <aside className="va-sidebar">
      <button className="va-sidebar__logo" onClick={handleLogoClick} aria-label="Voltar para a página inicial">
        <img src={logoImage} alt="Orcoma Academy" />
      </button>

      <div className="va-sidebar__header">
        <h2 className="va-sidebar__title">{cursoTitulo}</h2>
        <div className="va-sidebar__bar">
          <div className="va-sidebar__bar-fill" style={{ width: progressoGeral + '%' }} />
        </div>
        <div className="va-sidebar__stats">
          <span className="va-sidebar__progress">{progressoGeral}% concluído</span>
          <span> · {concluidas}/{totalAulas} aulas</span>
        </div>
      </div>

      <nav className="va-sidebar__modules" aria-label="Módulos do curso">
        {modulos.map((modulo, mIdx) => {
          const sorted = sortMaterials(modulo.materiais || []);
          return (
            <div key={modulo.id} className="va-sidebar__module">
              <div className="va-sidebar__module-label">
                <span className="va-sidebar__module-number">{mIdx + 1}</span>
                {modulo.titulo}
              </div>
              <ul>
                {sorted.map((item) => {
                  const { material, originalIdx } = item;
                  const lessonKey = mIdx + '-' + originalIdx;
                  const isCurrent = mIdx === moduloAtualIdx && originalIdx === aulaAtualIdx;
                  const isCompleted = completedLessons.has(lessonKey);
                  const isLocked = mIdx > moduloAtualIdx + 1;
                  const info = getLessonInfo(material.modalidade);
                  const isVideo = info.typeClass === 'video';

                  return (
                    <li key={material.id} className={isVideo ? '' : 'va-sidebar__lesson--material'}>
                      <button
                        className={
                          'va-sidebar__lesson' +
                          (isCurrent ? ' active' : '') +
                          (isCompleted ? ' completed' : '') +
                          (isLocked ? ' locked' : '') +
                          (!isVideo ? ' va-sidebar__lesson--non-video' : '')
                        }
                        onClick={() => !isLocked && onSelectAula(mIdx, originalIdx, material)}
                        disabled={isLocked}
                        aria-current={isCurrent ? 'true' : undefined}
                        aria-label={
                          material.titulo +
                          (isCompleted ? ' - Concluída' : isCurrent ? ' - Em andamento' : '')
                        }
                      >
                        <span className="va-sidebar__lesson-icon">
                          {isCompleted ? (
                            <span className="va-check-circle done">
                              <svg viewBox="0 0 16 16" width="16" height="16">
                                <circle cx="8" cy="8" r="7" fill="#10b981" />
                                <path d="M5 8l2 2 4-4" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          ) : isCurrent ? (
                            <i className={info.icon} />
                          ) : isLocked ? (
                            <i className="fa-solid fa-lock" />
                          ) : (
                            <span className="va-check-circle">
                              <svg viewBox="0 0 16 16" width="16" height="16">
                                <circle cx="8" cy="8" r="7" stroke="#6b7280" strokeWidth="1.2" fill="none" />
                              </svg>
                            </span>
                          )}
                        </span>
                        <span className="va-sidebar__lesson-title">{material.titulo}</span>
                        {!isCompleted && !isCurrent && !isLocked && (
                          <span className={'va-sidebar__lesson-type ' + info.typeClass}>{info.label}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
