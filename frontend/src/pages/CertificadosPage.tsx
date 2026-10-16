import { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { CertificadoModal, formatarData } from '../components/CertificadoModal';
import { CertificadoPreview } from '../components/CertificadoPreview';

interface Certificado {
  id: number;
  codigo: string;
  emitido_em: string;
  curso_titulo: string;
  curso_descricao: string | null;
  curso_duracao: string | null;
  curso_modulos: string | null;
  aluno_nome: string;
  download_url: string;
}

export function CertificadosPage() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificado | null>(null);

  useEffect(() => {
    ApiService.get('/api/certificados/')
      .then((data) => setCertificados(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '12px 24px' }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: '1.3125rem', fontWeight: 800, marginBottom: '16px', color: '#ff9d00' }}>Meus Certificados</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
          <p style={{ marginTop: '12px' }}>Carregando certificados...</p>
        </div>
      ) : certificados.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 12px' }}>
          <i className="fa-solid fa-certificate" style={{ fontSize: '3rem', color: 'var(--color-accent)', marginBottom: '16px' }}></i>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', fontWeight: 600, textAlign: 'center' }}>Nenhum certificado ainda</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Complete cursos para gerar certificados</p>
        </div>
      ) : (
        <div className="cursos-grid">
          {certificados.map((cert) => (
            <div key={cert.id} className="curso-card">
              <div className="curso-card__image" style={{ background: '#e9ecf3' }}>
                <CertificadoPreview
                  alunoNome={cert.aluno_nome}
                  cursoTitulo={cert.curso_titulo}
                  emitidoEm={cert.emitido_em}
                  codigo={cert.codigo}
                  cursoDescricao={cert.curso_descricao}
                  cursoModulos={cert.curso_modulos}
                  cursoDuracao={cert.curso_duracao}
                />
                <span className="curso-card__status" style={{ background: 'rgba(245,158,11,0.85)', color: '#fff' }}>Certificado</span>
              </div>
              <div className="curso-card__name">{cert.curso_titulo}</div>
              <div className="curso-card__divider"></div>
              <div className="curso-card__meta" style={{ justifyContent: 'space-between' }}>
                <span><i className="fa-solid fa-calendar"></i> {formatarData(cert.emitido_em)}</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCert(cert); }}
                    style={{ color: 'var(--color-accent)', background: 'none', border: 'none', textDecoration: 'none', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                  >
                    <i className="fa-solid fa-eye"></i> Visualizar
                  </button>
                  <a
                    href={cert.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    <i className="fa-solid fa-download"></i> Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCert && (
        <CertificadoModal certificado={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
}
