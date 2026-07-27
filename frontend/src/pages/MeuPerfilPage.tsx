import { useState, useEffect, useRef, useCallback } from 'react';
import { AuthService } from '../services/auth';
import { ApiService } from '../services/api';

const PLANO_MAP: Record<string, string> = {
  admin: 'Administrador',
  cliente_orcoma: 'Cliente Orcoma',
  colaborador_orcoma: 'Orcoma Team',
  gestor_orcoma: 'Orcoma Business',
  empresario: 'Empresário',
  visitor: 'Visitante',
};

function corDoNome(nome: string) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  return colors[Math.abs(hash) % colors.length];
}

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function normalizarNivel(nivel: string) {
  const mapa: Record<string, string> = {
    tecnico: 'tecnico', tecnologo: 'tecnologo', bacharel: 'bacharel',
    'pos-graduado': 'posgraduado', posgraduado: 'posgraduado', mestre: 'mestre', doutor: 'doutor',
  };
  return mapa[nivel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] || '';
}

interface Profile {
  id?: number;
  nome: string;
  email: string;
  role: string;
  empresa: string;
  telefone?: string;
  plano_nome: string;
  sobre: string;
  avatar_url?: string;
  created_at?: string;
}

interface Formacao {
  id: number;
  instituicao: string;
  nivel: string;
  area: string;
  inicio_mes: string;
  inicio_ano: string;
  termino_mes: string;
  termino_ano: string;
}

interface Habilidade {
  id: number;
  nome: string;
}

export function MeuPerfilPage() {
  const [profile, setProfile] = useState<Profile>({ nome: '', email: '', role: 'visitor', empresa: '', plano_nome: '', sobre: '' });
  const [formacoes, setFormacoes] = useState<Formacao[]>([]);
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);

  const [sobreText, setSobreText] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerDraft, setComposerDraft] = useState('');
  const [sobreCounter, setSobreCounter] = useState(0);

  const [formacaoModalOpen, setFormacaoModalOpen] = useState(false);
  const [formacaoEditId, setFormacaoEditId] = useState<number | null>(null);
  const [formacaoForm, setFormacaoForm] = useState({ instituicao: '', nivel: '', area: '', inicio_mes: '', inicio_ano: '', termino_mes: '', termino_ano: '' });

  const [habilidadeModalOpen, setHabilidadeModalOpen] = useState(false);
  const [habilidadeInput, setHabilidadeInput] = useState('');

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const confirmResolveRef = useRef<(v: boolean) => void>(() => {});

  const [insigniaModalOpen, setInsigniaModalOpen] = useState(false);
  const [insigniaData, setInsigniaData] = useState<{ key: string; icon: string; name: string; desc: string } | null>(null);

  const [certCount] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const anoAtual = new Date().getFullYear();

  const insigniaPermitidas: Record<string, { key: string; icon: string; name: string; desc: string }[]> = {
    admin: [
      { key: 'admin', icon: 'fa-shield-halved', name: 'Administrador', desc: 'Acesso total à plataforma com permissões de gerenciamento.' },
      { key: 'certificado', icon: 'fa-certificate', name: 'Certificado', desc: 'Concluiu um curso e recebeu um certificado.' },
    ],
    cliente_orcoma: [
      { key: 'certificado', icon: 'fa-certificate', name: 'Certificado', desc: 'Concluiu um curso e recebeu um certificado.' },
    ],
    colaborador_orcoma: [
      { key: 'certificado', icon: 'fa-certificate', name: 'Certificado', desc: 'Concluiu um curso e recebeu um certificado.' },
    ],
    gestor_orcoma: [
      { key: 'certificado', icon: 'fa-certificate', name: 'Certificado', desc: 'Concluiu um curso e recebeu um certificado.' },
    ],
    empresario: [
      { key: 'certificado', icon: 'fa-certificate', name: 'Certificado', desc: 'Concluiu um curso e recebeu um certificado.' },
    ],
  };

  const fetchProfile = useCallback(async () => {
    try {
      const data = await ApiService.getMe();
      const p: Profile = {
        id: data.id,
        nome: data.nome || data.first_name || data.username || '',
        email: data.email || '',
        role: data.role || AuthService.getRole(),
        empresa: data.perfil?.empresa || '',
        telefone: data.perfil?.telefone || '',
        plano_nome: data.plano_nome || '',
        sobre: data.perfil?.bio || '',
        avatar_url: data.avatar_url || data.perfil?.avatar || '',
        created_at: data.date_joined || null,
      };
      setProfile(p);
      setSobreText(p.sobre);
      if (p.avatar_url) AuthService.setUser({ avatar: p.avatar_url });
    } catch {
      setProfile({
        nome: AuthService.getName(),
        email: AuthService.getEmail(),
        role: AuthService.getRole(),
        empresa: '',
        plano_nome: '',
        sobre: '',
      });
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    ApiService.getFormacoes().then(setFormacoes).catch(() => {});
    ApiService.getHabilidades().then(setHabilidades).catch(() => {});
  }, [fetchProfile]);

  const createdDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    : '—';

  const formacaoLabel = formacoes.length > 0 ? formacoes[0].nivel + ' em ' + formacoes[0].area : '';

  const initials = profile.nome ? profile.nome.charAt(0).toUpperCase() : '?';

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { alert('Formato não suportado. Use JPG, PNG ou WebP.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Arquivo muito grande. Máximo 5MB.'); return; }
    try {
      const data = await ApiService.uploadAvatar(file);
      if (data?.avatar_url) {
        setProfile((prev) => ({ ...prev, avatar_url: data.avatar_url }));
        AuthService.setUser({ avatar: data.avatar_url });
      }
    } catch (err: any) {
      alert(err?.message || 'Erro ao enviar avatar.');
    }
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleSobreSave = async () => {
    const texto = composerDraft.trim();
    if (!texto) return;
    setSobreText(texto);
    setComposerOpen(false);
    try { await ApiService.patchMe({ perfil: { bio: texto } }); } catch {}
  };

  const showConfirm = (msg: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmMessage(msg);
      confirmResolveRef.current = resolve;
      setConfirmModalOpen(true);
    });
  };

  const handleFormacaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { instituicao, nivel, area, inicio_mes, inicio_ano } = formacaoForm;
    if (!instituicao.trim() || !nivel || !area.trim() || !inicio_mes || !inicio_ano) return;
    const dados = { ...formacaoForm };
    if (formacaoEditId) {
      await ApiService.patchFormacao(formacaoEditId, dados);
    } else {
      await ApiService.postFormacao(dados);
    }
    setFormacaoModalOpen(false);
    setFormacaoEditId(null);
    setFormacaoForm({ instituicao: '', nivel: '', area: '', inicio_mes: '', inicio_ano: '', termino_mes: '', termino_ano: '' });
    ApiService.getFormacoes().then(setFormacoes).catch(() => {});
  };

  const handleFormacaoEdit = async (id: number) => {
    const items = await ApiService.getFormacoes();
    const f = items.find((i: Formacao) => i.id === id);
    if (!f) return;
    setFormacaoEditId(id);
    setFormacaoForm({ instituicao: f.instituicao, nivel: f.nivel, area: f.area, inicio_mes: f.inicio_mes, inicio_ano: f.inicio_ano, termino_mes: f.termino_mes, termino_ano: f.termino_ano });
    setFormacaoModalOpen(true);
  };

  const handleFormacaoDelete = async (id: number) => {
    const confirmed = await showConfirm('Tem certeza que deseja excluir esta formação?');
    if (!confirmed) return;
    await ApiService.delFormacao(id);
    ApiService.getFormacoes().then(setFormacoes).catch(() => {});
  };

  const handleHabilidadeAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const nome = habilidadeInput.trim();
    if (!nome) return;
    await ApiService.postHabilidade({ nome });
    setHabilidadeInput('');
    setHabilidadeModalOpen(false);
    ApiService.getHabilidades().then(setHabilidades).catch(() => {});
  };

  const handleHabilidadeDelete = async (id: number) => {
    await ApiService.delHabilidade(id);
    ApiService.getHabilidades().then(setHabilidades).catch(() => {});
  };

  return (
    <div className="profile-page">
      <div className="profile-row">
        {/* LEFT COLUMN — Profile Card */}
        <div className="profile-card">
          <div className="profile-card__avatar-wrap">
            <div className="profile-card__avatar" style={!profile.avatar_url ? { background: corDoNome(profile.nome || 'U'), color: '#fff' } : undefined}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div className="profile-card__avatar-overlay" onClick={() => avatarInputRef.current?.click()}>
              <i className="fa-solid fa-camera"></i>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarUpload} />
          </div>

          <h2 className="profile-card__name">{profile.nome || 'Usuário'}</h2>
          <span className="profile-card__badge">{PLANO_MAP[profile.role] || profile.role}</span>
          {formacaoLabel && <span className="profile-card__formacao">{formacaoLabel}</span>}

          <div className="profile-card__divider"></div>

          <div className="profile-card__section">
            <span className="profile-card__section-title">Insígnias</span>
            <div className="insignias-grid">
              {(insigniaPermitidas[profile.role] || []).map((ins) => (
                <div key={ins.key} className="insignia-card" onClick={() => { setInsigniaData(ins); setInsigniaModalOpen(true); }}>
                  <div className="insignia-card__icon"><i className={`fa-solid ${ins.icon}`}></i></div>
                  <span className={`insignia-card__name pill-${ins.key}`}>{ins.name}</span>
                </div>
              ))}
              {(!insigniaPermitidas[profile.role] || insigniaPermitidas[profile.role].length === 0) && (
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Nenhuma insígnia</p>
              )}
            </div>
          </div>

          <div className="profile-card__divider"></div>

          <div className="profile-card__info">
            <span><i className="fa-regular fa-envelope"></i> {profile.email}</span>
            <span><i className="fa-solid fa-building"></i> {profile.empresa || '—'}</span>
            <span><i className="fa-regular fa-calendar"></i> Membro desde {createdDate}</span>
          </div>

          <div className="profile-card__divider"></div>

          <div className="profile-card__section">
            <span className="profile-card__section-title">Sobre</span>
            <p className="sobre-card__text">{sobreText || 'Nenhuma descrição'}</p>
            <span className="sobre-card__pill" onClick={() => { setComposerDraft(sobreText); setComposerOpen(true); setSobreCounter(sobreText.length); }}>
              {sobreText ? 'Editar descrição' : '+ Adicionar descrição'}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="profile-col-right">
          {/* FORMAÇÃO ACADÊMICA */}
          <div className="settings-card">
            <div className="settings-card__header">
              <div className="settings-card__title-bar"></div>
              <i className="fa-solid fa-graduation-cap"></i>
              Formação Acadêmica
            </div>
            <div className="settings-card__body">
              <div className="formacao-lista">
                {formacoes.length === 0 ? (
                  <p className="formacao-empty">Nenhuma formação adicionada</p>
                ) : formacoes.map((f) => {
                  const cor = normalizarNivel(f.nivel);
                  return (
                    <div key={f.id} className="formacao-item">
                      <div className={`formacao-item__icon formacao-item__icon--${cor}`}><i className="fa-solid fa-graduation-cap"></i></div>
                      <div className="formacao-item__info">
                        <span className="formacao-item__curso">{escapeHtml(f.area)}</span>
                        <span className="formacao-item__instituicao">{escapeHtml(f.instituicao)}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span className={`formacao-item__badge formacao-item__badge--${cor}`}>{escapeHtml(f.nivel)}</span>
                          <span className="formacao-item__periodo">{f.inicio_mes} {f.inicio_ano} a {f.termino_mes ? f.termino_mes + ' ' + f.termino_ano : 'Atual'}</span>
                        </span>
                      </div>
                      <div className="formacao-item__actions">
                        <button className="formacao-item__btn formacao-item__btn--edit" title="Editar" onClick={() => handleFormacaoEdit(f.id)}><i className="fa-solid fa-pencil"></i></button>
                        <button className="formacao-item__btn formacao-item__btn--delete" title="Excluir" onClick={() => handleFormacaoDelete(f.id)}><i className="fa-solid fa-trash-can"></i></button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="formacao-btn" onClick={() => { setFormacaoEditId(null); setFormacaoForm({ instituicao: '', nivel: '', area: '', inicio_mes: '', inicio_ano: '', termino_mes: '', termino_ano: '' }); setFormacaoModalOpen(true); }}>
                <i className="fa-solid fa-plus"></i> Adicionar Formação
              </button>
            </div>
          </div>

          {/* HABILIDADES */}
          <div className="settings-card">
            <div className="settings-card__header">
              <div className="settings-card__title-bar"></div>
              <i className="fa-solid fa-star"></i>
              Habilidades
            </div>
            <div className="settings-card__body">
              <div className="habilidades-lista">
                {habilidades.length === 0 ? (
                  <p className="formacao-empty">Nenhuma habilidade adicionada</p>
                ) : habilidades.map((h) => (
                  <span key={h.id} className="habilidade-tag">
                    {escapeHtml(h.nome)}
                    <button className="habilidade-tag__remove" onClick={() => handleHabilidadeDelete(h.id)} title="Remover"><i className="fa-solid fa-xmark"></i></button>
                  </span>
                ))}
              </div>
              <button className="formacao-btn" onClick={() => { setHabilidadeInput(''); setHabilidadeModalOpen(true); }}>
                <i className="fa-solid fa-plus"></i> Adicionar Habilidade
              </button>
            </div>
          </div>

          {/* CERTIFICADOS */}
          <div className="settings-card">
            <div className="settings-card__header">
              <div className="settings-card__title-bar"></div>
              <i className="fa-solid fa-certificate"></i>
              Certificados
            </div>
            <div className="settings-card__body">
              <div className="cert-card">
                <div className="cert-card__icon"><i className="fa-solid fa-certificate"></i></div>
                <div className="cert-card__count">
                  <span className="cert-card__number">{certCount}</span>
                  <span className="cert-card__label">Certificados emitidos</span>
                </div>
              </div>
              <div className="cert-card__pill" onClick={() => alert('Catálogo de certificados em breve!')}>
                <i className="fa-solid fa-eye"></i> Consultar catálogo
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SOBRE COMPOSER MODAL */}
      {composerOpen && (
        <div className="sobre-composer-overlay" onClick={() => setComposerOpen(false)}>
          <div className="sobre-composer" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Sobre você</h3>
            <textarea
              className="sobre-card__textarea"
              maxLength={6000}
              value={composerDraft}
              onChange={(e) => { setComposerDraft(e.target.value); setSobreCounter(e.target.value.length); }}
              placeholder="Conte um pouco sobre você..."
            />
            <div className="sobre-card__footer">
              <span className="sobre-card__counter">{sobreCounter}/6000</span>
              <div className="sobre-card__actions">
                <button className="sobre-card__btn sobre-card__btn--cancel" onClick={() => setComposerOpen(false)}>Cancelar</button>
                <button className="sobre-card__btn sobre-card__btn--save" disabled={!composerDraft.trim()} onClick={handleSobreSave}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORMAÇÃO MODAL */}
      {formacaoModalOpen && (
        <div className="sobre-composer-overlay" onClick={() => setFormacaoModalOpen(false)}>
          <div className="sobre-composer" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>{formacaoEditId ? 'Editar Formação' : 'Adicionar Formação'}</h3>
            <form onSubmit={handleFormacaoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="settings-field">
                <label className="settings-field__label">Instituição</label>
                <input className="settings-field__input" value={formacaoForm.instituicao} onChange={(e) => setFormacaoForm({ ...formacaoForm, instituicao: e.target.value })} required />
              </div>
              <div className="settings-field">
                <label className="settings-field__label">Nível</label>
                <select className="settings-field__input" value={formacaoForm.nivel} onChange={(e) => setFormacaoForm({ ...formacaoForm, nivel: e.target.value })} required>
                  <option value="">Selecione</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Tecnólogo">Tecnólogo</option>
                  <option value="Bacharel">Bacharel</option>
                  <option value="Pós-graduado">Pós-graduado</option>
                  <option value="Mestre">Mestre</option>
                  <option value="Doutor">Doutor</option>
                </select>
              </div>
              <div className="settings-field">
                <label className="settings-field__label">Área de estudo</label>
                <input className="settings-field__input" value={formacaoForm.area} onChange={(e) => setFormacaoForm({ ...formacaoForm, area: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="settings-field">
                  <label className="settings-field__label">Mês início</label>
                  <select className="settings-field__input" value={formacaoForm.inicio_mes} onChange={(e) => setFormacaoForm({ ...formacaoForm, inicio_mes: e.target.value })} required>
                    <option value="">Mês</option>
                    {meses.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="settings-field">
                  <label className="settings-field__label">Ano início</label>
                  <select className="settings-field__input" value={formacaoForm.inicio_ano} onChange={(e) => setFormacaoForm({ ...formacaoForm, inicio_ano: e.target.value })} required>
                    <option value="">Ano</option>
                    {Array.from({ length: anoAtual - 1950 + 1 }, (_, i) => anoAtual - i).map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="settings-field">
                  <label className="settings-field__label">Mês término</label>
                  <select className="settings-field__input" value={formacaoForm.termino_mes} onChange={(e) => setFormacaoForm({ ...formacaoForm, termino_mes: e.target.value })}>
                    <option value="">Mês</option>
                    {meses.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="settings-field">
                  <label className="settings-field__label">Ano término</label>
                  <select className="settings-field__input" value={formacaoForm.termino_ano} onChange={(e) => setFormacaoForm({ ...formacaoForm, termino_ano: e.target.value })}>
                    <option value="">Ano</option>
                    {Array.from({ length: anoAtual - 1950 + 1 }, (_, i) => anoAtual - i).map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="sobre-card__btn sobre-card__btn--cancel" onClick={() => setFormacaoModalOpen(false)}>Cancelar</button>
                <button type="submit" className="sobre-card__btn sobre-card__btn--save">{formacaoEditId ? 'Salvar' : 'Adicionar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HABILIDADE MODAL */}
      {habilidadeModalOpen && (
        <div className="sobre-composer-overlay" onClick={() => setHabilidadeModalOpen(false)}>
          <div className="sobre-composer" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Adicionar Habilidade</h3>
            <form onSubmit={handleHabilidadeAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="settings-field">
                <label className="settings-field__label">Nome da habilidade</label>
                <input className="settings-field__input" value={habilidadeInput} onChange={(e) => setHabilidadeInput(e.target.value)} placeholder="Ex: Gestão de projetos" required autoFocus />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="sobre-card__btn sobre-card__btn--cancel" onClick={() => setHabilidadeModalOpen(false)}>Cancelar</button>
                <button type="submit" className="sobre-card__btn sobre-card__btn--save">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmModalOpen && (
        <div className="confirm-modal is-open">
          <div className="confirm-modal__overlay" onClick={() => { setConfirmModalOpen(false); confirmResolveRef.current(false); }}></div>
          <div className="confirm-modal__content">
            <div className="confirm-modal__icon"><i className="fa-solid fa-circle-question"></i></div>
            <p className="confirm-modal__message">{confirmMessage}</p>
            <div className="confirm-modal__actions">
              <button className="confirm-modal__btn confirm-modal__btn--cancel" onClick={() => { setConfirmModalOpen(false); confirmResolveRef.current(false); }}>Cancelar</button>
              <button className="confirm-modal__btn confirm-modal__btn--confirm" onClick={() => { setConfirmModalOpen(false); confirmResolveRef.current(true); }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* INSÍGNIA MODAL */}
      {insigniaModalOpen && insigniaData && (
        <div className="insignia-modal is-open">
          <div className="insignia-modal__overlay" onClick={() => setInsigniaModalOpen(false)}></div>
          <div className="insignia-modal__content">
            <button className="insignia-modal__close" onClick={() => setInsigniaModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            <div className="insignia-modal__icon"><i className={`fa-solid ${insigniaData.icon}`}></i></div>
            <h3 className={`insignia-modal__name pill-${insigniaData.key}`}>{insigniaData.name}</h3>
            <p className="insignia-modal__desc">{insigniaData.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}


