import { useEffect, useState } from 'react';
import { ApiService } from '../services/api';

interface Certificado {
  id: number;
  codigo: string;
  emitido_em: string;
  curso_titulo: string;
  curso_duracao: string | null;
  aluno_nome: string;
  download_url: string;
}

export function CertificadosPage() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.get('/api/certificados/')
      .then((data) => setCertificados(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: '1.6rem', fontWeight: 700, marginBottom: '24px' }}>Meus Certificados</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
          <p style={{ marginTop: '12px' }}>Carregando certificados...</p>
        </div>
      ) : certificados.length === 0 ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '60px 24px', textAlign: 'center' }}>
          <i className="fa-solid fa-certificate" style={{ fontSize: '3rem', color: 'var(--color-accent)', marginBottom: '16px', display: 'block' }}></i>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Nenhum certificado ainda</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Complete cursos para gerar certificados</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {certificados.map((cert) => (
            <div
              key={cert.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-certificate" style={{ color: '#f59e0b', fontSize: '1.3rem' }}></i>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '2px' }}>{cert.curso_titulo}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Emitido em {new Date(cert.emitido_em).toLocaleDateString('pt-BR')}
                  {cert.curso_duracao && ` · ${cert.curso_duracao}`}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Código: {cert.codigo}
                </div>
              </div>
              <a
                href={cert.download_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: 'linear-gradient(135deg, var(--color-accent-2), #2563eb)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-download"></i> Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}