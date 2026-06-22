'use client';

import { cn } from '@/lib/utils';
import { CircleHelp, ChevronDown, Lock, ChevronRight, Info } from 'lucide-react';
import type { ToggleSetting } from '@/store/prototype-store';
import { usePrototypeStore, type CrmType } from '@/store/prototype-store';
import { useState, useRef, useEffect } from 'react';

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
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTooltip) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTooltip]);

  if (activeMode !== 'basic') return null;

  const extendedToggles = getExtendedConfiguredToggles(crm, scenarioId);
  const globalExtended = crm === 'amocrm'
    ? usePrototypeStore.getState().amocrmGlobal.filter((g) => g.mode === 'extended')
    : usePrototypeStore.getState().bitrix24Global.filter((g) => g.mode === 'extended');

  const enabledItems = extendedToggles.filter((t) => t.enabled);
  const globalEnabledItems = globalExtended.filter((g) => g.enabled);
  const totalEnabled = enabledItems.length + globalEnabledItems.length;

  const allItems = [
    ...globalEnabledItems.map((g) => g.label),
    ...enabledItems.map((t) => t.label),
  ];

  if (totalEnabled === 0) return null;

  return (
    <div className="relative" ref={tooltipRef}>
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[12px] font-medium text-blue-700">
            Расширенные настройки
          </span>
          {totalEnabled > 0 && (
            <span className="bg-blue-100 text-blue-600 text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
              {totalEnabled}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Info icon with tooltip */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
            className="w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Info className="w-3 h-3 text-blue-500" />
          </button>
          <button
            onClick={() => setMode('extended')}
            className="text-[11px] text-blue-500 hover:text-blue-600 font-medium cursor-pointer"
          >
            Открыть →
          </button>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-[300px] p-3">
          <p className="text-[11px] font-semibold text-gray-700 mb-2">Настроено в Расширенных:</p>
          <div className="space-y-1">
            {allItems.map((label) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-[11px] text-gray-600">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => { setShowTooltip(false); setMode('extended'); }}
              className="text-[11px] text-blue-500 hover:text-blue-600 font-medium cursor-pointer"
            >
              Перейти к редактированию →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}