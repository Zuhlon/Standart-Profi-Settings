'use client';

import { usePrototypeStore, type ModeType } from '@/store/prototype-store';
import { cn } from '@/lib/utils';
import { Sparkles, Cpu, Loader2 } from 'lucide-react';

const TOOLTIPS: Record<ModeType, string> = {
  basic: 'Самые востребованные настройки, достаточные для работы с CRM',
  extended: 'Набор настроек для полной кастомизации работы с CRM, учитывающий все нюансы обработки заказа',
};

export function ModeTabs() {
  const { activeMode, setMode, modeLoading } = usePrototypeStore();

  const modes: { value: ModeType; label: string; icon: React.ReactNode }[] = [
    { value: 'basic', label: 'Стандарт', icon: <Sparkles className="w-4 h-4" /> },
    { value: 'extended', label: 'Профессионал', icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
      {modes.map((mode) => {
        const isActive = activeMode === mode.value;
        const isChanging = modeLoading && !isActive;
        return (
          <div key={mode.value} className="relative group">
            <button
              onClick={() => !modeLoading && setMode(mode.value)}
              disabled={modeLoading}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50',
                (modeLoading || isChanging) && 'opacity-50 cursor-not-allowed',
                !modeLoading && 'cursor-pointer'
              )}
            >
              {modeLoading && isActive ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                mode.icon
              )}
              <span>{mode.label}</span>
            </button>

            {/* Tooltip on hover */}
            <div
              className={cn(
                'absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded-lg bg-gray-800 text-white text-[11px] leading-relaxed',
                'w-[280px] text-center shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200',
                'before:content-[""] before:absolute before:left-1/2 before:-translate-x-1/2 before:top-full before:border-4 before:border-transparent before:border-t-gray-800',
                'z-50'
              )}
            >
              {TOOLTIPS[mode.value]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CrmTabs() {
  const { activeCrm, setCrm } = usePrototypeStore();

  return (
    <div className="flex gap-1">
      {[
        { value: 'amocrm' as const, label: 'amoCRM' },
        { value: 'bitrix24' as const, label: 'Битрикс24' },
      ].map((crm) => (
        <button
          key={crm.value}
          onClick={() => setCrm(crm.value)}
          className={cn(
            'px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer',
            activeCrm === crm.value
              ? 'text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          )}
        >
          {crm.label}
        </button>
      ))}
    </div>
  );
}