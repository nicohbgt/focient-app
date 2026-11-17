import React from 'react';
import { useFoCientI18n, LanguageSwitcher } from '../i18n/I18nContext.js';
import { Badge } from '../primitive/Badge.js';
import { SearchIcon, BellIcon, SunIcon, PlusIcon } from '../icons/index.js';
import { FoCientLogo } from '../brand/FoCientLogo.js';
import { FoCientWordmark } from '../brand/FoCientWordmark.js';
import { getAvatarInitial } from '../../lib/utils.js';

export interface TopNavBarProps {
  pageTitle?: string;
  dateLabel?: string;
  workloadPercentage?: number;
  isScrolled?: boolean;
  showDateNavigator?: boolean;
  onNavigateDate?: (direction: 'prev' | 'next' | 'today') => void;
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
  onThemeToggle?: () => void;
  userAvatarUrl?: string;
  userName?: string;
  userRole?: string;
  className?: string;
}

/**
 * FoCient Top Navigation Bar (<TopNavBar/>)
 *
 * Desktop 64px, Mobile 56px.
 * Features quick search (⌘K), date navigator / timeline switcher,
 * live workload indicator (65%), adaptive notification bell, and language selector.
 * Scrolled elevation activates dynamic backdrop blur without layout shift.
 */
export const TopNavBar: React.FC<TopNavBarProps> = ({
  pageTitle,
  dateLabel,
  workloadPercentage = 65,
  isScrolled = false,
  showDateNavigator = true,
  onNavigateDate,
  onSearchClick,
  onNotificationsClick,
  onThemeToggle,
  userAvatarUrl,
  userName = 'FoCient User',
  className = '',
}) => {
  const { copywriting } = useFoCientI18n();
  const displayTitle = pageTitle || copywriting.navigation.todayPlan;
  const displayDate = dateLabel || copywriting.navigation.dateToday;

  return (
    <header
      className={[
        'focient-top-nav',
        isScrolled ? 'focient-top-nav--scrolled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Left: Page Title + Date Navigator */}
      <div className="focient-top-nav-left">
        <h1 className="focient-page-title">{displayTitle}</h1>

        {showDateNavigator ? (
          <div className="focient-date-navigator" role="group" aria-label={copywriting.navigation.todayPlan}>
            <button
              type="button"
              className="focient-date-nav-btn"
              onClick={() => onNavigateDate?.('prev')}
              aria-label={copywriting.navigation.datePrevious}
              title={copywriting.navigation.datePrevious}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className="focient-date-nav-pill"
              onClick={() => onNavigateDate?.('today')}
              aria-label={copywriting.navigation.dateToday}
              title={copywriting.navigation.dateToday}
            >
              <Badge variant="neutral" size="xs">
                {displayDate}
              </Badge>
            </button>
            <button
              type="button"
              className="focient-date-nav-btn"
              onClick={() => onNavigateDate?.('next')}
              aria-label={copywriting.navigation.dateNext}
              title={copywriting.navigation.dateNext}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        ) : (
          <Badge variant="neutral" size="xs">
            {displayDate}
          </Badge>
        )}
      </div>

      {/* Center: Quick Search Bar with Cmd+K (Desktop - Optional) */}
      {onSearchClick && (
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
            <kbd style={{ fontSize: '11px', padding: '1px 5px', background: '#F1F5F9', borderRadius: '4px', border: '1px solid #CBD5E1', fontFamily: 'monospace' }}>
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Right: Notifications + Avatar + Lang Switcher */}
      <div className="focient-top-nav-right">
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
            <img src={userAvatarUrl} alt={userName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            getAvatarInitial(userName)
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
  badgeCount?: number;
  shortcutHint?: string;
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
 * For Desktop screens >= 1024px (expanded 260px) and Tablets 600px-1023px (collapsed rail 72px).
 * Features smooth transitions, active Cobalt indicator bar, 300ms anti-flicker hover tooltip,
 * and integrated Daily Capacity Meter.
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
  const workloadPercent = totalCapacityMinutes > 0 ? Math.min(100, Math.round((allocatedMinutes / totalCapacityMinutes) * 100)) : 0;

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
        {/* Brand / Logo + Collapse Button (Collapsed: Logo only acting as expand button; Expanded: Wordmark + Collapse button) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            marginBottom: '24px',
            padding: collapsed ? '4px 0' : '0',
          }}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="group flex items-center justify-center p-1.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label={copywriting.navigation.sidebarExpand}
              title={copywriting.navigation.sidebarExpand}
            >
              <img
                src="/brand/focient-logo.png"
                alt="FoCient Logo"
                className="w-7 h-7 object-contain rounded-lg transition-transform group-hover:scale-105"
              />
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', padding: '2px 0' }}>
                <FoCientWordmark height={16} />
              </div>
              {onToggleCollapse && (
                <button
                  type="button"
                  className="focient-btn focient-btn--ghost focient-btn--sm"
                  onClick={onToggleCollapse}
                  aria-label={copywriting.navigation.sidebarCollapse}
                  title={copywriting.navigation.sidebarCollapse}
                  style={{ padding: '0 6px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              )}
            </>
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
              data-tooltip={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
            >
              <span className="focient-nav-item-icon">{item.icon}</span>
              {!collapsed && <span className="focient-nav-item-label">{item.label}</span>}
              {!collapsed && typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                <span className={['focient-nav-item-badge', item.active ? 'focient-nav-item-badge--active' : ''].filter(Boolean).join(' ')}>
                  {item.badgeCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Sidebar Workload Capacity Indicator */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        {!collapsed ? (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: workloadPercent > 90 ? '#D97706' : workloadPercent > 75 ? '#2563EB' : '#0D9488',
                  }}
                />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {copywriting.capacity.dailyWorkload}
                </span>
              </div>
              <span className="focient-tnum" style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                {workloadPercent}%
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, workloadPercent)}%`,
                  height: '100%',
                  backgroundColor: workloadPercent > 90 ? '#D97706' : workloadPercent > 75 ? '#2563EB' : '#0D9488',
                  borderRadius: '3px',
                  transition: 'width 250ms ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
              <span>{allocatedMinutes}m</span>
              <span>{totalCapacityMinutes}m</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 4px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              gap: '4px',
            }}
            data-tooltip={`${copywriting.capacity.dailyWorkload}: ${workloadPercent}%`}
            title={`${copywriting.capacity.dailyWorkload}: ${workloadPercent}%`}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: workloadPercent > 90 ? '#D97706' : workloadPercent > 75 ? '#2563EB' : '#0D9488',
              }}
            />
            <span className="focient-tnum" style={{ fontSize: '10px', fontWeight: 700, color: '#0F172A' }}>
              {workloadPercent}%
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export interface BottomNavBarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  badgeCount?: number;
  onClick?: () => void;
}

export interface BottomNavBarProps {
  items: BottomNavBarItem[];
  onAddClick?: () => void;
  hideOnKeyboard?: boolean;
  isKeyboardActive?: boolean;
  className?: string;
}

/**
 * FoCient Bottom Navigation Bar (<BottomNavBar/>)
 *
 * For Mobile screens <= 600px.
 * Features 4 touch-safe tabs (min 48px hit area) + 1 central action button.
 * Active items display an active filled icon, 11px SemiBold text, and a 4px active micro-dot.
 * Automatically translates down when virtual keyboard is active to eliminate screen clipping.
 */
export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  items,
  onAddClick,
  hideOnKeyboard = false,
  isKeyboardActive = false,
  className = '',
}) => {
  const isHidden = hideOnKeyboard || isKeyboardActive;

  return (
    <nav
      className={[
        'focient-bottom-nav',
        isHidden ? 'focient-bottom-nav--hidden' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
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
          aria-label={item.label}
        >
          <div className="focient-bottom-nav-icon-wrapper">
            {item.icon}
            {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
              <span className="focient-bottom-nav-badge">{item.badgeCount}</span>
            )}
          </div>
          <span className="focient-bottom-nav-label">{item.label}</span>
          {item.active && <span className="focient-bottom-nav-dot" aria-hidden="true" />}
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
          aria-label={item.label}
        >
          <div className="focient-bottom-nav-icon-wrapper">
            {item.icon}
            {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
              <span className="focient-bottom-nav-badge">{item.badgeCount}</span>
            )}
          </div>
          <span className="focient-bottom-nav-label">{item.label}</span>
          {item.active && <span className="focient-bottom-nav-dot" aria-hidden="true" />}
        </button>
      ))}
    </nav>
  );
};
