export function CertificadosPage() {
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: '1.6rem', fontWeight: 700, marginBottom: '16px' }}>Certificados</h1>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center' }}>
        <i className="fa-solid fa-certificate" style={{ fontSize: '3rem', color: 'var(--color-accent)', marginBottom: '16px', display: 'block' }}></i>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Seus certificados aparecerão aqui</p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Complete cursos para gerar certificados</p>
      </div>
    </div>
  );
}