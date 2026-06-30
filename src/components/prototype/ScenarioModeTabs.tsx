'use client';

import { usePrototypeStore, type ModeType } from '@/store/prototype-store';
import { cn } from '@/lib/utils';
import { Sparkles, Cpu } from 'lucide-react';

const TOOLTIPS: Record<ModeType, string> = {
  basic: 'Самые востребованные настройки, достаточные для работы с CRM',
  extended: 'Набор настроек для полной кастомизации работы с CRM, учитывающий все нюансы обработки заказа',
};

export function ScenarioModeTabs({ onModeSwitch }: { onModeSwitch: (mode: ModeType) => void }) {
  const { activeMode } = usePrototypeStore();

  const modes: { value: ModeType; label: string; icon: React.ReactNode }[] = [
    {
      value: 'basic',
      label: 'Стандарт',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      value: 'extended',
      label: 'Профессионал',
      icon: <Cpu className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
      {modes.map((mode) => (
        <div key={mode.value} className="relative group">
          <button
            onClick={() => onModeSwitch(mode.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-200 cursor-pointer',
              activeMode === mode.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            )}
          >
            {mode.icon}
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
      ))}
    </div>
  );
}