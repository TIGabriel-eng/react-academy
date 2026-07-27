import type { Material } from '../../types';

interface MaterialsListProps {
  materiais: Material[];
}

function getFileExtension(modalidade?: string): string {
  return (modalidade || 'pdf').toUpperCase();
}

function getFileClass(ext: string): string {
  if (ext === 'XLS' || ext === 'XLSX') return 'xls';
  if (ext === 'ZIP') return 'zip';
  return 'pdf';
}

export function MaterialsList({ materiais }: MaterialsListProps) {
  const downloadables = materiais.filter(
    (m) => m.modalidade !== 'video' && m.modalidade !== 'link'
  );

  if (downloadables.length === 0) {
    return (
      <div className="va-materials-empty">
        <i className="fa-regular fa-folder-open" style={{ fontSize: '2rem', opacity: 0.3 }} />
        <p>Nenhum material disponível para este módulo.</p>
      </div>
    );
  }

  return (
    <div className="va-materials-list">
      {downloadables.map((mat) => {
        const ext = getFileExtension(mat.modalidade);
        const cls = getFileClass(ext);
        return (
          <div key={mat.id} className="va-material-item">
            <div className={'va-material-icon ' + cls}>{ext}</div>
            <div className="va-material-info">
              <strong>{mat.titulo}</strong>
              <span>{ext}{mat.tamanho ? ' · ' + mat.tamanho : ''}</span>
            </div>
            {mat.arquivo_url && (
              <a
                href={mat.arquivo_url}
                className="va-material-dl"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={'Baixar ' + mat.titulo}
              >
                <i className="fa-solid fa-download" /> Baixar
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
