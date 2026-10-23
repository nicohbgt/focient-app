import React from 'react';
import { useFoCientI18n, LanguageSwitcher } from '../i18n/I18nContext.js';
import { Badge } from '../primitive/Badge.js';
import { DailyCapacityMeter } from './DailyCapacityMeter.js';
import { SearchIcon, BellIcon, SunIcon, PlusIcon } from '../icons/index.js';

export interface TopNavBarProps {
  pageTitle?: string;
  dateLabel?: string;
  workloadPercentage?: number;
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
  onThemeToggle?: () => void;
  userAvatarUrl?: string;
  userName?: string;
  className?: string;
}

/**
 * FoCient Top Navigation Bar (<TopNavBar/>)
 *
 * Desktop 64px, Mobile 56px.
 * Features quick search (Cmd+K), date switcher, live workload indicator (⚡ 65%),
 * adaptive notification bell, and language selector.
 */
export const TopNavBar: React.FC<TopNavBarProps> = ({
  pageTitle,
  dateLabel = 'Hari Ini / Today',
  workloadPercentage = 65,
  onSearchClick,
  onNotificationsClick,
  onThemeToggle,
  userAvatarUrl,
  userName = 'FoCient User',
  className = '',
}) => {
  const { copywriting } = useFoCientI18n();
  const displayTitle = pageTitle || copywriting.navigation.todayPlan;

  return (
    <header className={['focient-top-nav', className].filter(Boolean).join(' ')}>
      {/* Left: Page Title + Date Indicator */}
      <div className="focient-top-nav-left">
        <h1 className="focient-page-title">{displayTitle}</h1>
        <Badge variant="neutral" size="xs">
          {dateLabel}
        </Badge>
      </div>

      {/* Center: Quick Search Bar with Cmd+K (Desktop) */}
      <div className="focient-top-nav-center">
        <button
          type="button"
          className="focient-btn focient-btn--ghost focient-btn--sm"
          style={{ width: '100%', justifyContent: 'space-between', color: 'var(--color-text-muted, #64748B)' }}
          onClick={onSearchClick}
          aria-label={copywriting.navigation.searchPlaceholder}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SearchIcon size="xs" />
            <span>{copywriting.navigation.searchPlaceholder}</span>
          </span>
          <kbd style={{ fontSize: '11px', padding: '1px 4px', background: '#F1F5F9', borderRadius: '3px' }}>
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Workload Indicator + Notifications + Avatar + Lang Switcher */}
      <div className="focient-top-nav-right">
        {/* Workload Indicator Pill */}
        <Badge variant={workloadPercentage > 90 ? 'warning' : 'focus'} size="sm">
          {copywriting.navigation.workloadShort(workloadPercentage)}
        </Badge>

        {/* Adaptive Notification Bell */}
        <button
          type="button"
          className="focient-btn focient-btn--ghost focient-btn--sm"
          style={{ padding: '0 8px', minWidth: '36px' }}
          onClick={onNotificationsClick}
          aria-label={copywriting.navigation.notifications}
        >
          <BellIcon size="xs" />
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle (Optional) */}
        {onThemeToggle && (
          <button
            type="button"
            className="focient-btn focient-btn--ghost focient-btn--sm"
            style={{ padding: '0 8px', minWidth: '36px' }}
            onClick={onThemeToggle}
            aria-label={copywriting.navigation.toggleTheme}
          >
            <SunIcon size="xs" />
          </button>
        )}

        {/* User Avatar */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#DBEAFE',
            color: '#1E3A8A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '13px',
          }}
          aria-label={userName}
        >
          {userAvatarUrl ? (
            <img src={userAvatarUrl} alt={userName} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
          ) : (
            userName.slice(0, 2).toUpperCase()
          )}
        </div>
      </div>
    </header>
  );
};

export interface SideNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export interface SideNavBarProps {
  items: SideNavItem[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  allocatedMinutes?: number;
  totalCapacityMinutes?: number;
  userName?: string;
  userRole?: string;
  className?: string;
}

/**
 * FoCient Side Navigation Bar (<SideNavBar/>)
 *
 * For Desktop screens >= 1024px.
 * Features expanded (250px) / collapsed (72px) states,
 * active item Cobalt accent, and integrated Daily Capacity Meter.
 */
export const SideNavBar: React.FC<SideNavBarProps> = ({
  items,
  collapsed = false,
  onToggleCollapse,
  allocatedMinutes = 240,
  totalCapacityMinutes = 360,
  userName = 'FoCient Pro',
  userRole = 'Flow Optimizer',
  className = '',
}) => {
  const { copywriting } = useFoCientI18n();

  return (
    <aside
      className={[
        'focient-side-nav',
        collapsed ? 'focient-side-nav--collapsed' : 'focient-side-nav--expanded',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div>
        {/* Brand / Logo + Collapse Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-primary-text-bold, #1E3A8A)' }}>
                FoCient
              </span>
            </div>
          )}
          {onToggleCollapse && (
            <button
              type="button"
              className="focient-btn focient-btn--ghost focient-btn--sm"
              onClick={onToggleCollapse}
              aria-label={collapsed ? copywriting.navigation.sidebarExpand : copywriting.navigation.sidebarCollapse}
              style={{ padding: '0 6px', margin: collapsed ? '0 auto' : undefined }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={[
                'focient-nav-item',
                item.active ? 'focient-nav-item--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              title={collapsed ? item.label : undefined}
            >
              <span className="focient-nav-item-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Integrated Widget: Daily Capacity Meter + Profile */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {!collapsed && (
          <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
            <DailyCapacityMeter
              allocatedMinutes={allocatedMinutes}
              totalCapacityMinutes={totalCapacityMinutes}
            />
          </div>
        )}

        {/* Profile Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            {userName.slice(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main, #0F172A)' }}>
                {userName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>
                {userRole}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export interface BottomNavBarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export interface BottomNavBarProps {
  items: BottomNavBarItem[];
  onAddClick?: () => void;
  className?: string;
}

/**
 * FoCient Bottom Navigation Bar (<BottomNavBar/>)
 *
 * For Mobile screens <= 600px.
 * Features 4 touch-safe tabs (min 48px hit area) + 1 central action button.
 */
export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  items,
  onAddClick,
  className = '',
}) => {
  return (
    <nav className={['focient-bottom-nav', className].filter(Boolean).join(' ')}>
      {items.slice(0, 2).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={item.onClick}
          className={[
            'focient-bottom-nav-item',
            item.active ? 'focient-bottom-nav-item--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}

      {/* Central Add Action Button */}
      {onAddClick && (
        <button
          type="button"
          className="focient-bottom-nav-add-btn"
          onClick={onAddClick}
          aria-label="Tambah tugas baru"
        >
          <PlusIcon size="sm" strokeWidth={2.5} />
        </button>
      )}

      {items.slice(2, 4).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={item.onClick}
          className={[
            'focient-bottom-nav-item',
            item.active ? 'focient-bottom-nav-item--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
