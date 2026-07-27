interface MobileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'video', label: 'Vídeo', icon: 'fa-solid fa-play' },
  { id: 'comentarios', label: 'Comentários', icon: 'fa-regular fa-comment' },
  { id: 'aulas', label: 'Aulas', icon: 'fa-solid fa-list' },
  { id: 'materiais', label: 'Materiais', icon: 'fa-regular fa-folder-open' },
];

export function MobileTabs({ activeTab, onTabChange }: MobileTabsProps) {
  return (
    <nav className="va-mobile-tabs" aria-label="Navegação da aula">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={'va-mobile-tabs__btn' + (activeTab === tab.id ? ' active' : '')}
          onClick={() => onTabChange(tab.id)}
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          <i className={tab.icon} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
