'use client';

import { cn } from '@/lib/utils';
import { CircleHelp, ChevronDown } from 'lucide-react';
import type { ToggleSetting, FunnelSetting } from '@/store/prototype-store';
import { usePrototypeStore, type CrmType } from '@/store/prototype-store';

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

interface FunnelRowProps {
  funnel: FunnelSetting;
  onFunnelChange: (field: 'funnel' | 'status', value: string) => void;
  disabled?: boolean;
}

export function FunnelRow({ funnel, onFunnelChange, disabled }: FunnelRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] text-gray-600">{funnel.label}</span>
      <div className="flex items-center gap-2">
        <select
          value={funnel.funnel}
          onChange={(e) => onFunnelChange('funnel', e.target.value)}
          disabled={disabled}
          className={cn(
            'flex-1 h-8 text-[12px] border border-gray-200 rounded px-2 bg-white text-gray-700 cursor-pointer',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          <option value="">Выберите воронку</option>
          <option value="Основная воронка">Основная воронка</option>
          <option value="Воронка продаж">Воронка продаж</option>
          <option value="Воронка поддержки">Воронка поддержки</option>
        </select>
        <select
          value={funnel.status}
          onChange={(e) => onFunnelChange('status', e.target.value)}
          disabled={disabled}
          className={cn(
            'flex-1 h-8 text-[12px] border border-gray-200 rounded px-2 bg-white text-gray-700 cursor-pointer',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          <option value="">Статус</option>
          <option value="Новый контакт">Новый контакт</option>
          <option value="Принятый">Принятый</option>
          <option value="Пропущенный">Пропущенный</option>
          <option value="В работе">В работе</option>
        </select>
      </div>
    </div>
  );
}

interface LockedProSectionProps {
  crm: CrmType;
  scenarioId: string;
  title: string;
}

export function LockedProSection({ crm, scenarioId, title }: LockedProSectionProps) {
  const { activeMode, setMode, getProConfiguredCount } = usePrototypeStore();
  if (activeMode !== 'minimal') return null;

  const proCount = getProConfiguredCount(crm, scenarioId);
  const globalProEnabled = crm === 'amocrm'
    ? usePrototypeStore.getState().amocrmGlobal.filter((g) => g.mode === 'pro' && g.enabled).length
    : usePrototypeStore.getState().bitrix24Global.filter((g) => g.mode === 'pro' && g.enabled).length;
  const totalPro = proCount + globalProEnabled;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center">
            <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-[13px] font-medium text-gray-600">{title}</span>
          {totalPro > 0 && (
            <span className="bg-amber-100 text-amber-700 text-[11px] font-medium px-2 py-0.5 rounded-full">
              {totalPro} настроено в Профи
            </span>
          )}
        </div>
        <button
          onClick={() => setMode('pro')}
          className="text-[12px] text-blue-500 hover:text-blue-600 font-medium cursor-pointer"
        >
          Перейти к редактированию →
        </button>
      </div>
      {totalPro > 0 && (
        <p className="text-[11px] text-gray-400 mt-1 ml-7">
          Эти настройки недоступны в режиме «Минимальный». Переключитесь в «Профи» для редактирования.
        </p>
      )}
    </div>
  );
}