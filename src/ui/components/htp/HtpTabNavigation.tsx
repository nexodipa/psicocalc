import React from 'react';
import { Home, TreePine, User, PenTool, FileText } from 'lucide-react';

export type HtpSubTab = 'formal' | 'house' | 'tree' | 'person' | 'synthesis';

interface HtpTabNavigationProps {
  activeTab: HtpSubTab;
  onSelectTab: (tab: HtpSubTab) => void;
}

interface TabItem {
  id: HtpSubTab;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}

const TABS: TabItem[] = [
  {
    id: 'formal',
    label: '1. Pautas Expresivas',
    shortLabel: 'Expresivos',
    icon: PenTool,
    color: 'blue',
  },
  {
    id: 'house',
    label: '2. Casa (Hogar / Vínculos)',
    shortLabel: 'Casa',
    icon: Home,
    color: 'amber',
  },
  {
    id: 'tree',
    label: '3. Árbol (Yo Profundo)',
    shortLabel: 'Árbol',
    icon: TreePine,
    color: 'emerald',
  },
  {
    id: 'person',
    label: '4. Persona (Esquema Corporal)',
    shortLabel: 'Persona',
    icon: User,
    color: 'indigo',
  },
  {
    id: 'synthesis',
    label: '5. Síntesis Pericial',
    shortLabel: 'Síntesis',
    icon: FileText,
    color: 'slate',
  },
];

export const HtpTabNavigation: React.FC<HtpTabNavigationProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Pestañas de Láminas HTP"
      className="flex flex-wrap gap-1.5 p-1 bg-slate-200/90 rounded-xl border border-slate-300/80 shadow-inner"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
              isActive
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-900' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
};
