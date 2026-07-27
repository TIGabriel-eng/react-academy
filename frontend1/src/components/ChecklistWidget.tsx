import { useState, useEffect, useRef } from 'react';

const CHECKLIST_ITEMS = [
  { id: 'ck1', label: 'Assista uma aula completa', delay: 2000 },
  { id: 'ck2', label: 'Baixe 1 material de apoio', delay: 5000 },
  { id: 'ck3', label: 'Responda ao fórum da aula', delay: 8000 },
  { id: 'ck4', label: 'Marque 1 curso como favorito', delay: 11000 },
];

export function ChecklistWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [jumping, setJumping] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    CHECKLIST_ITEMS.forEach((item) => {
      setTimeout(() => {
        setChecked((prev) => ({ ...prev, [item.id]: true }));
      }, item.delay);
    });
  }, []);

  useEffect(() => {
    if (!jumping) return;
    const interval = setInterval(() => {
      if (!iconRef.current) return;
      iconRef.current.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)';
      iconRef.current.style.transform = 'translateY(-16px) scale(1.15)';
      iconRef.current.style.boxShadow = '0 8px 32px rgba(255, 157, 0, 0.7)';
      setTimeout(() => {
        if (!iconRef.current) return;
        iconRef.current.style.transform = 'translateY(0) scale(1)';
        iconRef.current.style.boxShadow = '0 4px 20px rgba(255, 157, 0, 0.4)';
      }, 250);
    }, 850);
    return () => clearInterval(interval);
  }, [jumping]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleIconClick = () => {
    setJumping(false);
    if (iconRef.current) {
      iconRef.current.style.transition = 'none';
      iconRef.current.style.transform = 'none';
      iconRef.current.style.boxShadow = '0 4px 20px rgba(255, 157, 0, 0.4)';
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="checklist-widget" ref={panelRef}>
      <div
        className="checklist-widget__icon"
        ref={iconRef}
        onClick={handleIconClick}
      >
        <i className="fa-regular fa-lightbulb"></i>
      </div>
      <div className={`checklist-widget__panel ${isOpen ? 'is-visible' : ''}`}>
        <div className="checklist-widget__panel-header">
          <h4><i className="fa-regular fa-lightbulb"></i> Metas do Dia</h4>
          <button className="checklist-widget__close" onClick={() => setIsOpen(false)}>
            &times;
          </button>
        </div>
        <div className="checklist-widget__list">
          {CHECKLIST_ITEMS.map((item) => (
            <div key={item.id} className="checklist-widget__item">
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                readOnly
              />
              <label>{item.label}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
