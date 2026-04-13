import { useState } from 'react';
import './UserDropdown.scss';

export interface UserMenuItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

export interface UserMenuDivider {
  divider: true;
}

export type UserMenuEntry = UserMenuItem | UserMenuDivider;

export interface UserDropdownProps {
  username: string;
  menuItems: UserMenuEntry[];
  onOpen?: () => void;
  onClose?: () => void;
}

function isDivider(entry: UserMenuEntry): entry is UserMenuDivider {
  return 'divider' in entry && entry.divider === true;
}

export default function UserDropdown({
  username,
  menuItems,
  onOpen,
  onClose,
}: UserDropdownProps) {
  const [showMenu, setShowMenu] = useState(false);

  function toggle() {
    const next = !showMenu;
    setShowMenu(next);
    if (next) onOpen?.(); else onClose?.();
  }

  function close() {
    setShowMenu(false);
    onClose?.();
  }

  return (
    <div className="sg-user-menu-wrapper">
      <button
        className="sg-icon-btn sg-user-btn"
        onClick={toggle}
        title="Account"
      >
        <span className="sg-user-icon">{'\u{1F464}'}</span>
        <span className="sg-user-name">{username}</span>
      </button>

      {showMenu && (
        <div className="sg-user-dropdown">
          <div className="sg-dropdown-header">Signed in as <strong>{username}</strong></div>
          {menuItems.map((entry, i) => {
            if (isDivider(entry)) {
              return <div key={`d-${i}`} className="sg-dropdown-divider" />;
            }
            return (
              <button
                key={entry.label}
                className={`sg-dropdown-item${entry.variant === 'danger' ? ' danger' : ''}`}
                onClick={() => { close(); entry.onClick(); }}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
