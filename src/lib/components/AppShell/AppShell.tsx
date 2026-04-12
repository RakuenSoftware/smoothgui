import { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AppShell.scss';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  section: string;
}

export interface AppShellProps {
  appName: string;
  appNameShort: string;
  navItems: NavItem[];
  topBarContent?: ReactNode;
  belowTopBar?: ReactNode;
  children?: ReactNode;
}

export default function AppShell({
  appName,
  appNameShort,
  navItems,
  topBarContent,
  belowTopBar,
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sections = [...new Set(navItems.map(i => i.section))];

  return (
    <div className={`app-container${collapsed ? ' collapsed' : ''}`}>
      <nav className="sidebar">
        <div className="sidebar-header">
          {!collapsed && <span className="logo">{appName}</span>}
          {collapsed && <span className="logo-short">{appNameShort}</span>}
          <button
            className="toggle-btn"
            onClick={() => setCollapsed(v => !v)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        <div className="nav-sections">
          {sections.map(section => (
            <div key={section} className="nav-section">
              {!collapsed && <div className="section-label">{section}</div>}
              {navItems.filter(i => i.section === section).map(item => (
                <NavLink
                  key={item.route}
                  to={item.route}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  title={item.label}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <div className="main-area">
        <header className="top-bar">
          <div className="top-bar-spacer" />
          {topBarContent && (
            <div className="top-bar-actions">{topBarContent}</div>
          )}
        </header>

        {belowTopBar}

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}
