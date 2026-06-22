'use client';

import { usePrototypeStore, type ModeType } from '@/store/prototype-store';
import { cn } from '@/lib/utils';
import { Sparkles, Cpu } from 'lucide-react';

export function ScenarioModeTabs({ onModeSwitch }: { onModeSwitch: (mode: ModeType) => void }) {
  const { activeMode } = usePrototypeStore();

  const modes: { value: ModeType; label: string; icon: React.ReactNode }[] = [
    {
      value: 'basic',
      label: 'Базовые',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      value: 'extended',
      label: 'Расширенные',
      icon: <Cpu className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
      {modes.map((mode) => (
        <button
          key={mode.value}
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
      ))}
    </div>
  );
}