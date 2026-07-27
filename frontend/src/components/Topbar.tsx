import { useEffect, useState, useCallback } from 'react';
import { AuthService } from '../services/auth';
import { PLANO_MAP } from '../types';

interface TopbarProps {
  onMenuToggle: () => void;
  onSearchOpen: () => void;
  showSearch: boolean;
  showProfile: boolean;
}

export function Topbar({ onMenuToggle, onSearchOpen, showSearch, showProfile }: TopbarProps) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [userName, setUserName] = useState(AuthService.getName());
  const [avatar, setAvatar] = useState(AuthService.getAvatar());
  const [role, setRole] = useState(AuthService.getRole());
  const [plano, setPlano] = useState(AuthService.getPlanoNome());
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.style.backgroundColor = '#E6F1FB';
      document.body.style.backgroundColor = '#E6F1FB';
      document.body.style.color = '#1a1a2e';
      document.body.classList.add('light-mode');
    } else {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onSearchOpen();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearchOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUserName(AuthService.getName());
      setAvatar(AuthService.getAvatar());
      setRole(AuthService.getRole());
      setPlano(AuthService.getPlanoNome());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/login';
  };

  return (
    <header className="topbar">
      <button className="topbar__menu-btn" onClick={onMenuToggle} aria-label="Abrir menu">
        <i className="fa-solid fa-bars"></i>
      </button>

      {showSearch && (
        <div className="topbar__search" onClick={onSearchOpen} style={{ cursor: 'pointer' }}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Buscar cursos, trilhas ou conteúdos..." readOnly tabIndex={-1} />
          <kbd>Ctrl K</kbd>
        </div>
      )}

      <div className="topbar__actions">
        <button className="topbar__icon-btn" onClick={toggleTheme} aria-label="Alternar tema" style={{ fontSize: '18px', cursor: 'pointer' }}>
          {theme === 'light' ? '☀️' : '🌙'}
        </button>
        <button className="topbar__icon-btn" aria-label="Notificações">
          <i className="fa-regular fa-bell"></i>
          <span className="topbar__notif-dot"></span>
        </button>

        {showProfile && (
          <div className="topbar-profile" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px' }} onClick={() => setProfileOpen(!profileOpen)}>
              <img src={avatar || '../assets/images/avatar-icon.jpg'} alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-accent)' }} onError={(e) => { (e.target as HTMLImageElement).src = '../assets/images/avatar-icon.jpg'; }} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span className="progress-sidebar__username">{userName}</span>
                <span className={`progress-sidebar__plan pill-${role === 'admin' ? 'admin' : role === 'empresario' ? 'empresario' : role === 'visitor' ? 'visitor' : plano.toLowerCase().includes('premium') ? 'premium' : role === 'colaborador_orcoma' ? 'colaborador_orcoma' : 'cliente'}`}>
                  {PLANO_MAP[role] || 'Visitante'}
                </span>
              </div>
              <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'none' }}></i>
            </div>
            {profileOpen && (
              <div className="profile-dropdown is-visible" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px' }} onClick={(e) => e.stopPropagation()}>
                <a href="/meu-perfil" className="profile-dropdown__item" onClick={() => setProfileOpen(false)}>
                  <i className="fa-regular fa-user"></i> Meu Perfil
                </a>
                <a href="/meus-cursos" className="profile-dropdown__item" onClick={() => setProfileOpen(false)}>
                  <i className="fa-solid fa-graduation-cap"></i> Meus cursos
                </a>
                <a href="/certificados" className="profile-dropdown__item" onClick={() => setProfileOpen(false)}>
                  <i className="fa-solid fa-certificate"></i> Certificados
                </a>
                <div className="profile-dropdown__divider"></div>
                <a href="#" className="profile-dropdown__item profile-dropdown__item--logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                  <i className="fa-solid fa-right-from-bracket"></i> Sair
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
