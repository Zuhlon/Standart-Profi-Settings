'use client';

import { usePrototypeStore, type ModeType } from '@/store/prototype-store';
import { cn } from '@/lib/utils';
import { Sparkles, Cpu, Loader2 } from 'lucide-react';

export function ModeTabs() {
  const { activeMode, setMode, modeLoading } = usePrototypeStore();

  const modes: { value: ModeType; label: string; icon: React.ReactNode }[] = [
    { value: 'basic', label: 'Базовые', icon: <Sparkles className="w-4 h-4" /> },
    { value: 'extended', label: 'Расширенные', icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
      {modes.map((mode) => {
        const isActive = activeMode === mode.value;
        const isChanging = modeLoading && !isActive;
        return (
          <button
            key={mode.value}
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
        );
      })}
    </div>
  );
}

export function CrmTabs() {
  const { activeCrm, setCrm } = usePrototypeStore();

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
      {[
        { value: 'amocrm' as const, label: 'amoCRM', color: 'bg-amber-500' },
        { value: 'bitrix24' as const, label: 'Битрикс24', color: 'bg-sky-500' },
      ].map((crm) => (
        <button
          key={crm.value}
          onClick={() => setCrm(crm.value)}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer',
            activeCrm === crm.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
          )}
        >
          <div className={cn('w-2 h-2 rounded-full', crm.color)} />
          <span>{crm.label}</span>
        </button>
      ))}
    </div>
  );
}