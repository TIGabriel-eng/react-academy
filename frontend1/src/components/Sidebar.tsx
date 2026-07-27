import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/auth';
import { NAV_ITEMS, ACADEMIES, MAIN_ACADEMIES } from '../types';
import type { AcademyConfig } from '../types';
import logoImage from '../assets/images/LOGO ORCOMA ACADEMY.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function getMainAcademy(academyKey: string): AcademyConfig {
  for (const mainKey of MAIN_ACADEMIES) {
    const main = ACADEMIES[mainKey];
    if (main.children?.includes(academyKey)) return main;
  }
  return ACADEMIES[academyKey] || ACADEMIES['Academy Business'];
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [envOpen, setEnvOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [premiumDismissed, setPremiumDismissed] = useState(false);
  const [currentAcademy, setCurrentAcademy] = useState<AcademyConfig>(getMainAcademy(AuthService.getCurrentAcademy()));
  const envRef = useRef<HTMLDivElement>(null);

  const plano = AuthService.getPlanoNome();

  useEffect(() => {
    const path = location.pathname;
    let academyKey = 'Academy Business';
    if (path.includes('/contabil')) {
      academyKey = 'Academy Contabil';
    } else if (path.includes('/empresarial')) {
      academyKey = 'Academy Empresarial';
    } else if (path.includes('/business')) {
      academyKey = 'Academy Business';
    } else if (path.includes('/time')) {
      academyKey = 'Academy Time';
    } else if (path.includes('/orcomakers')) {
      academyKey = 'Academy Orcomakers';
    } else if (path.includes('/team')) {
      academyKey = 'Academy Team';
    }
    AuthService.setCurrentAcademy(academyKey);
    setCurrentAcademy(getMainAcademy(academyKey));
  }, [location.pathname]);

  const handleNav = useCallback((page: string) => {
    if (page === 'sair') {
      AuthService.logout();
      navigate('/login');
      return;
    }
    const urlMap: Record<string, string> = {
      inicio: '/team',
      'meu-perfil': '/meu-perfil',
      cursos: '/meus-cursos',
      eventos: '/eventos',
      continuar: '/continuar-assistindo',
      concluidos: '/cursos-concluidos',
      certificados: '/certificados',
      trilhas: '/trilhas',
      suporte: '/suporte',
      config: '/configuracoes',
    };
    const url = urlMap[page];
    if (url) navigate(url);
  }, [navigate]);

  const handleEnvChange = (academyKey: string) => {
    AuthService.setCurrentAcademy(academyKey);
    setCurrentAcademy(ACADEMIES[academyKey]);
    setEnvOpen(false);
    navigate(ACADEMIES[academyKey].path);
  };

  const showPremium = !plano.toLowerCase().includes('premium') && !premiumDismissed;

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`} id="sidebar">
        <div className="sidebar__logo">
          <img src={logoImage} alt="Orcoma Academy" className="sidebar__logo-img" />
        </div>

        <nav className="sidebar__nav">
          <ul>
            {NAV_ITEMS.map((item, idx) => {
              if ('divider' in item) {
                return <li key={idx} className="nav-divider">{item.divider}</li>;
              }
              const navItem = item as typeof NAV_ITEMS[0] & { page: string };
              const isActive = location.pathname === navItem.path || location.pathname.startsWith(navItem.path + '/');
              return (
                <li
                  key={idx}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNav(navItem.page)}
                >
                  <i className={navItem.icon}></i>
                  <span>{navItem.label}</span>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar__env">
          <p className="sidebar__env-label">AMBIENTE ATIVO</p>
          <div className="sidebar__env-selector" onClick={() => setEnvOpen(!envOpen)} ref={envRef}>
            <i className={`fa-solid ${currentAcademy.icon}`}></i>
            <span>{currentAcademy.name}</span>
            <i className={`fa-solid fa-chevron-down ${envOpen ? 'is-open' : ''}`}></i>
          </div>
          <div className={`env-dropdown ${envOpen ? 'is-visible' : ''}`}>
            {MAIN_ACADEMIES.map((key) => {
              const academy = ACADEMIES[key];
              return (
                <div
                  key={key}
                  className={`env-dropdown__item ${currentAcademy.name === academy.name ? 'active' : ''}`}
                  onClick={() => handleEnvChange(key)}
                >
                  <i className={`fa-solid ${academy.icon}`}></i> {academy.name}
                </div>
              );
            })}
          </div>
        </div>

        {showPremium && (
          <div className="sidebar__premium">
            <div>
              <p className="premium__title"><i className="fa-solid fa-crown"></i> Seja Premium</p>
              <p className="premium__desc">Tenha acesso a todos os cursos, trilhas e certificados.</p>
            </div>
            <button className="btn-premium" onClick={() => setPricingOpen(true)}>
              Assinar agora <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        )}
      </aside>

      {isOpen && <div className="sidebar__overlay is-visible" onClick={onClose} id="sidebarOverlay"></div>}

      {premiumOpen && (
        <div className="premium-modal is-visible" onClick={() => setPremiumOpen(false)}>
          <div className="premium-modal__content" onClick={(e) => e.stopPropagation()}>
            <h1 className="premium-modal__title">Seja Premium!</h1>
            <h3 className="premium-modal__subtitle">
              Destaque seu currículo com a <strong>Orcoma Academy Premium</strong>! Tenha acesso ilimitado a todos os cursos, trilhas de aprendizagem e certificados da plataforma. Desenvolva novas habilidades, amplie seus conhecimentos e fortaleça seu currículo com uma formação completa e reconhecida.
            </h3>
            <div className="premium-modal__actions">
              <button className="premium-modal__btn premium-modal__btn--primary" onClick={() => { setPremiumOpen(false); setPricingOpen(true); }}>
                Assinar Agora!!
              </button>
              <button className="premium-modal__btn premium-modal__btn--secondary" onClick={() => { setPremiumOpen(false); setPremiumDismissed(true); }}>
                Agora não, talvez depois
              </button>
            </div>
          </div>
        </div>
      )}

      {pricingOpen && (
        <div className="premium-modal is-visible" onClick={() => setPricingOpen(false)}>
          <div className="premium-modal__content premium-modal__content--pricing" onClick={(e) => e.stopPropagation()}>
            <div className="pricing-card">
              <div className="pricing-card__ribbon">1º Lote</div>
              <div className="pricing-card__inner">
                <div className="pricing-card__badge">Premium</div>
                <div className="pricing-card__icon">
                  <i className="fa-solid fa-crown"></i>
                </div>
                <h2 className="pricing-card__title">Orcoma Academy</h2>
                <p className="pricing-card__subtitle">Acesso por 1 ano</p>
                <div className="pricing-card__divider"></div>
                <div className="pricing-card__price-row">
                  <span className="pricing-card__price-label">12x de</span>
                  <div className="pricing-card__price">
                    <span className="pricing-card__currency">R$</span>
                    <span className="pricing-card__amount">129</span>
                    <span className="pricing-card__cents">,99</span>
                  </div>
                  <span className="pricing-card__price-label">no cartão</span>
                </div>
                <p className="pricing-card__installments">ou R$ 1.299,99 à vista</p>
                <div className="pricing-card__divider"></div>
                <ul className="pricing-card__benefits">
                  <li><i className="fa-solid fa-check"></i> Todos os cursos da plataforma</li>
                  <li><i className="fa-solid fa-check"></i> Trilhas de aprendizagem exclusivas</li>
                  <li><i className="fa-solid fa-check"></i> Certificados reconhecidos</li>
                  <li><i className="fa-solid fa-check"></i> Suporte prioritário</li>
                </ul>
                <div className="pricing-card__divider"></div>
                <div className="pricing-card__payment-icons">
                  <i className="fa-brands fa-cc-visa"></i>
                  <i className="fa-brands fa-cc-mastercard"></i>
                  <i className="fa-brands fa-cc-amex"></i>
                  <i className="fa-brands fa-cc-apple-pay"></i>
                </div>
                <button className="pricing-card__btn">Finalizar Assinatura</button>
                <button className="pricing-card__btn pricing-card__btn--cancel" onClick={() => setPricingOpen(false)}>
                  Talvez Depois, mudei de ideia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}