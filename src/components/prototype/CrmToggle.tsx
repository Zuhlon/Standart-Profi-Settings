'use client';

import { cn } from '@/lib/utils';
import { CircleHelp, ChevronDown, Lock, ChevronRight } from 'lucide-react';
import type { ToggleSetting } from '@/store/prototype-store';
import { usePrototypeStore, type CrmType } from '@/store/prototype-store';
import { useState } from 'react';

interface CrmToggleProps {
  setting: ToggleSetting;
  disabled?: boolean;
  onToggle: () => void;
}

export function CrmToggle({ setting, disabled, onToggle }: CrmToggleProps) {
  return (
    <div className={cn('flex items-center justify-between py-1.5', disabled && 'opacity-60')}>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          disabled={disabled}
          className={cn(
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
            setting.enabled ? 'bg-amber-400' : 'bg-gray-300',
            disabled && 'cursor-not-allowed'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out',
              setting.enabled ? 'translate-x-4' : 'translate-x-0'
            )}
          />
        </button>
        <span className="text-[13px] text-gray-800">{setting.label}</span>
        {setting.hasInfo && (
          <CircleHelp className="w-3.5 h-3.5 text-gray-400 cursor-help flex-shrink-0" />
        )}
      </div>
      {setting.hasConfigure && (
        <button className="text-[12px] text-blue-500 hover:text-blue-600 font-medium flex items-center gap-0.5 cursor-pointer">
          Настроить <ChevronDown className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

interface LockedExtendedBlockProps {
  crm: CrmType;
  scenarioId: string;
}

export function LockedExtendedBlock({ crm, scenarioId }: LockedExtendedBlockProps) {
  const { activeMode, setMode, getExtendedConfiguredToggles } = usePrototypeStore();
  const [expanded, setExpanded] = useState(false);

  if (activeMode !== 'basic') return null;

  const extendedToggles = getExtendedConfiguredToggles(crm, scenarioId);
  const globalExtended = crm === 'amocrm'
    ? usePrototypeStore.getState().amocrmGlobal.filter((g) => g.mode === 'extended')
    : usePrototypeStore.getState().bitrix24Global.filter((g) => g.mode === 'extended');
  const globalEnabledCount = globalExtended.filter((g) => g.enabled).length;

  const enabledItems = extendedToggles.filter((t) => t.enabled);
  const totalEnabled = enabledItems.length + globalEnabledCount;

  if (totalEnabled === 0) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      {/* Header — always compact */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[12px] font-medium text-gray-600">
            Расширенные настройки
          </span>
          <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
            {totalEnabled}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            onClick={(e) => { e.stopPropagation(); setMode('extended'); }}
            className="text-[11px] text-blue-500 hover:text-blue-600 font-medium cursor-pointer"
          >
            Открыть →
          </span>
          <ChevronRight className={cn(
            'w-3.5 h-3.5 text-gray-400 transition-transform',
            expanded && 'rotate-90'
          )} />
        </div>
      </button>

      {/* Expanded list — compact */}
      {expanded && (
        <div className="px-3 pb-2 border-t border-gray-200/60">
          <div className="pt-1.5 space-y-0.5">
            {enabledItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-[11px] text-gray-500 truncate">{item.label}</span>
              </div>
            ))}
            {globalEnabledCount > 0 && globalExtended.map((g) => (
              g.enabled && (
                <div key={g.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-[11px] text-gray-500 truncate">{g.label}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}