import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { useFocient } from '../../state/focient-store.js';
import {
  SearchIcon,
  LayoutDashboardIcon,
  CalendarIcon,
  SparklesIcon,
  ClockIcon,
  BarChartIcon,
  PlusIcon,
} from '../icons/index.js';

export interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface PaletteActionItem {
  id: string;
  category: 'navigation' | 'actions' | 'tasks';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  shortcutBadge?: string;
  onSelect: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { copywriting, locale } = useFoCientI18n();
  const store = useFocient();

  const isOpen = propIsOpen !== undefined ? propIsOpen : store.isCommandPaletteOpen;
  const handleClose = propOnClose || (() => store.setIsCommandPaletteOpen(false));

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Build items collection
  const allItems: PaletteActionItem[] = useMemo(() => {
    const navItems: PaletteActionItem[] = [
      {
        id: 'nav-dashboard',
        category: 'navigation',
        title: copywriting.navigation.dashboard,
        subtitle: locale === 'id' ? 'Buka ringkasan utama' : 'Open main summary',
        icon: <LayoutDashboardIcon size="sm" />,
        shortcutBadge: 'G D',
        onSelect: () => {
          store.safeNavigate('dashboard');
          handleClose();
        },
      },
      {
        id: 'nav-plan',
        category: 'navigation',
        title: copywriting.navigation.todayPlan,
        subtitle: locale === 'id' ? 'Kelola fokus & jadwal hari ini' : 'Manage today focus & schedule',
        icon: <SparklesIcon size="sm" />,
        shortcutBadge: 'G P',
        onSelect: () => {
          store.safeNavigate('plan');
          handleClose();
        },
      },
      {
        id: 'nav-tasks',
        category: 'navigation',
        title: copywriting.navigation.tasks,
        subtitle: locale === 'id' ? 'Daftar semua tugas terstruktur' : 'List of all structured tasks',
        icon: <CalendarIcon size="sm" />,
        shortcutBadge: 'G T',
        onSelect: () => {
          store.safeNavigate('tasks');
          handleClose();
        },
      },
      {
        id: 'nav-reschedule',
        category: 'navigation',
        title: copywriting.navigation.reschedule,
        subtitle: locale === 'id' ? 'Penyesuaian ritme & kapasitas' : 'Rhythm & capacity rebalancing',
        icon: <ClockIcon size="sm" />,
        shortcutBadge: 'G R',
        onSelect: () => {
          store.safeNavigate('reschedule');
          handleClose();
        },
      },
      {
        id: 'nav-insights',
        category: 'navigation',
        title: copywriting.navigation.insights,
        subtitle: locale === 'id' ? 'Metrik beban & refleksi sehat' : 'Workload metrics & healthy reflection',
        icon: <BarChartIcon size="sm" />,
        shortcutBadge: 'G I',
        onSelect: () => {
          store.safeNavigate('insights');
          handleClose();
        },
      },
    ];

    const actionItems: PaletteActionItem[] = [
      {
        id: 'action-add-task',
        category: 'actions',
        title: locale === 'id' ? 'Tambah Tugas Baru' : 'Add New Task',
        subtitle: locale === 'id' ? 'Buka dialog entri tugas' : 'Open task creation dialog',
        icon: <PlusIcon size="sm" />,
        shortcutBadge: 'N',
        onSelect: () => {
          handleClose();
          store.openAddTaskModal();
        },
      },
      {
        id: 'action-toggle-sidebar',
        category: 'actions',
        title: store.isSidebarCollapsed ? copywriting.navigation.sidebarExpand : copywriting.navigation.sidebarCollapse,
        subtitle: locale === 'id' ? 'Beralih antara mode rel & lebar' : 'Toggle between rail & wide mode',
        icon: <LayoutDashboardIcon size="sm" />,
        shortcutBadge: '[',
        onSelect: () => {
          store.toggleSidebar();
          handleClose();
        },
      },
      {
        id: 'action-today',
        category: 'actions',
        title: locale === 'id' ? 'Lompat ke Hari Ini' : 'Jump to Today',
        subtitle: store.activeCalendarDate,
        icon: <CalendarIcon size="sm" />,
        shortcutBadge: 'T',
        onSelect: () => {
          store.navigateDate('today');
          handleClose();
        },
      },
      {
        id: 'action-switch-lang',
        category: 'actions',
        title: copywriting.navigation.switchLanguage,
        subtitle: locale === 'id' ? 'Saat ini: Bahasa Indonesia' : 'Current: English',
        icon: <SparklesIcon size="sm" />,
        shortcutBadge: 'L',
        onSelect: () => {
          store.toggleLanguage();
          handleClose();
        },
      },
    ];

    const taskItems: PaletteActionItem[] = store.tasks.map((task) => ({
      id: `task-${task.id}`,
      category: 'tasks',
      title: task.title,
      subtitle: `${task.categoryName} • ${task.durationMinutes} ${copywriting.capacity.minutesShort} • ${task.dateDisplay}`,
      icon: <SparklesIcon size="sm" />,
      shortcutBadge: task.priority === 'top3' ? 'Top 3' : undefined,
      onSelect: () => {
        store.setSelectedTaskForDetail(task);
        store.safeNavigate('tasks');
        handleClose();
      },
    }));

    return [...navItems, ...actionItems, ...taskItems];
  }, [copywriting, locale, store, handleClose]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const lower = query.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(lower))
    );
  }, [allItems, query]);

  // Adjust selectedIndex bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems.length, selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="focient-command-palette-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={copywriting.navigation.commandPaletteTitle}
    >
      <div
        className="focient-command-palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="focient-command-palette-search">
          <span style={{ color: 'var(--color-primary-action-base, #2563EB)', display: 'flex', alignItems: 'center' }}>
            <SearchIcon size="sm" />
          </span>
          <input
            ref={inputRef}
            type="text"
            className="focient-command-palette-input"
            placeholder={copywriting.navigation.commandPalettePlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            aria-label={copywriting.navigation.commandPaletteTitle}
          />
          <kbd className="focient-command-palette-kbd">ESC</kbd>
        </div>

        {/* Results List */}
        <div className="focient-command-palette-list" role="listbox">
          {filteredItems.length === 0 ? (
            <div className="focient-command-palette-empty">
              {copywriting.navigation.commandPaletteNoResults}
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  id={`palette-item-${item.id}`}
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    'focient-command-palette-item',
                    isSelected ? 'focient-command-palette-item--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => item.onSelect()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span className="focient-command-palette-item-icon">{item.icon}</span>
                  <div className="focient-command-palette-item-text">
                    <span className="focient-command-palette-item-title">{item.title}</span>
                    {item.subtitle && (
                      <span className="focient-command-palette-item-subtitle">{item.subtitle}</span>
                    )}
                  </div>
                  {item.shortcutBadge && (
                    <span className="focient-command-palette-shortcut">{item.shortcutBadge}</span>
                  )}
                  {isSelected && (
                    <kbd className="focient-command-palette-kbd">↵</kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer Shortcuts Hint */}
        <div className="focient-command-palette-footer">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>
              <kbd className="focient-command-palette-kbd-inline">↑</kbd>{' '}
              <kbd className="focient-command-palette-kbd-inline">↓</kbd>{' '}
              {locale === 'id' ? 'Navigasi' : 'Navigate'}
            </span>
            <span>
              <kbd className="focient-command-palette-kbd-inline">↵</kbd>{' '}
              {locale === 'id' ? 'Pilih' : 'Select'}
            </span>
            <span>
              <kbd className="focient-command-palette-kbd-inline">ESC</kbd>{' '}
              {locale === 'id' ? 'Tutup' : 'Close'}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>FoCient Quick Flow</span>
        </div>
      </div>
    </div>
  );
};
