import type { Material } from '../../types';

interface MaterialsListProps {
  materiais: Material[];
}

function getExtensionFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const match = path.match(/\.([a-zA-Z0-9]+)$/);
    if (match) return match[1].toLowerCase();
  } catch {
    const match = url.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
    if (match) return match[1].toLowerCase();
  }
  return '';
}

function getFileExtension(mat: Material): string {
  const fromUrl = mat.arquivo_url ? getExtensionFromUrl(mat.arquivo_url) : '';
  if (fromUrl) return fromUrl.toUpperCase();
  return (mat.modalidade || 'pdf').toUpperCase();
}

function getFileClass(ext: string): string {
  const e = ext.toLowerCase();
  if (['xls', 'xlsx', 'csv'].includes(e)) return 'xls';
  if (e === 'zip') return 'zip';
  if (['ppt', 'pptx'].includes(e)) return 'ppt';
  if (['doc', 'docx', 'rtf', 'odt', 'word'].includes(e)) return 'word';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(e)) return 'img';
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
        const ext = getFileExtension(mat);
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
