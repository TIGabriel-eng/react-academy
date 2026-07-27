import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/auth';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RightPanel } from './RightPanel';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const academyRoutes = ['/team', '/business', '/time', '/orcomakers', '/contabil', '/empresarial'];
  const noRightPanelRoutes = ['/time', '/orcomakers', '/contabil', '/empresarial'];
  const showRightPanel = academyRoutes.includes(location.pathname) && !noRightPanelRoutes.includes(location.pathname);
  const showSearch = academyRoutes.includes(location.pathname);
  const showProfileInTopbar = noRightPanelRoutes.includes(location.pathname);

  useEffect(() => {
    if (!AuthService.isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleMenuToggle = () => setSidebarOpen(!sidebarOpen);
  const handleSearchOpen = () => { if (showSearch) setSearchOpen(true); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar onMenuToggle={handleMenuToggle} onSearchOpen={handleSearchOpen} showSearch={showSearch} showProfile={showProfileInTopbar} />
        <main className="main-content" id="mainContent" style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
      {showRightPanel && <RightPanel />}
      {searchOpen && (
        <div className="search-modal-overlay is-visible" onClick={() => setSearchOpen(false)} id="searchModalOverlay">
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal__header">
              <i className="fa-solid fa-magnifying-glass search-modal__icon"></i>
              <span className="search-modal__title">Search</span>
            </div>
            <div className="search-modal__subtitle">Como podemos te ajudar?</div>
            <div className="search-modal__divider"></div>
            <div className="search-modal__input-wrap">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Pesquisar..." autoComplete="off" />
            </div>
            <div className="search-modal__divider"></div>
            <div className="search-modal__filter">
              <i className="fa-solid fa-sliders"></i>
              <span>Filtrar</span>
            </div>
            <div className="search-modal__nav">
              <button className="search-modal__nav-item is-active" data-filter="recomendados">
                <i className="fa-solid fa-star"></i> Recomendados
              </button>
              <button className="search-modal__nav-item" data-filter="eventos">
                <i className="fa-solid fa-calendar-days"></i> Eventos
              </button>
            </div>
            <div className="search-modal__results" id="searchModalResults"></div>
          </div>
        </div>
      )}
    </div>
  );
}