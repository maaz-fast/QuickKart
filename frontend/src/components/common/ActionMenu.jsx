import { useState, useEffect, useRef } from 'react';

const ActionMenu = ({ items, testId = "action-menu" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const menuRef = useRef(null);

  const handleToggle = () => {
    if (!isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const distFromBottom = window.innerHeight - rect.bottom;
      // Open upward if near bottom of viewport (< 200px)
      setOpenUpward(distFromBottom < 200);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="action-menu-wrapper" ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        type="button"
        className="action-dots-btn"
        onClick={handleToggle}
        data-testid={testId}
        aria-label="Actions menu"
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-secondary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 150ms ease'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="19" cy="12" r="1"/>
          <circle cx="5" cy="12" r="1"/>
        </svg>
      </button>

      {isOpen && (
        <div 
          className="action-dropdown-popup"
          style={{
            position: 'absolute',
            right: 0,
            ...(openUpward ? { bottom: 'calc(100% + 4px)' } : { top: 'calc(100% + 4px)' }),
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 100,
            width: 'max-content',
            minWidth: '140px',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            whiteSpace: 'nowrap'
          }}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className={`action-menu-item ${item.isDelete ? 'delete' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                if (item.onClick) item.onClick();
              }}
              data-testid={item.testId}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 14px',
                border: 'none',
                borderRadius: '8px',
                background: 'transparent',
                color: item.isDelete ? '#E53E3E' : 'var(--color-text-primary)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                transition: 'background 150ms ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', color: item.isDelete ? '#E53E3E' : 'var(--color-accent)', flexShrink: 0 }}>
                {item.icon}
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
  </svg>
);

export const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

export const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default ActionMenu;
