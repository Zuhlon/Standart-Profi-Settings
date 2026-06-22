'use client';

import { usePrototypeStore, type Scenario, type CrmType } from '@/store/prototype-store';
import { CrmToggle, LockedExtendedBlock } from './CrmToggle';
import { cn } from '@/lib/utils';
import {
  CircleHelp,
  X,
  RefreshCw,
  Plus,
  Search,
  Pencil,
  Trash2,
  FolderOpen,
  Phone,
} from 'lucide-react';
import { useState } from 'react';

function BitrixNavMenu({ activeItem }: { activeItem: string }) {
  const items = [
    { id: 'general', label: 'Общие настройки' },
    { id: 'users', label: 'Пользователи' },
    { id: 'scenarios', label: 'Сценарии' },
    { id: 'numbers', label: 'Многоканальные номера' },
  ];

  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <button
          key={item.id}
          className={cn(
            'w-full text-left px-3 py-2 rounded-md text-[13px] transition-colors cursor-pointer',
            activeItem === item.id
              ? 'bg-blue-50 text-blue-600 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function BitrixScenarioSidebar({ scenarios, selectedId, onSelect, crm }: {
  scenarios: Scenario[];
  selectedId: string;
  onSelect: (id: string) => void;
  crm: CrmType;
}) {
  const { toggleScenarioEnabled } = usePrototypeStore();
  const [search, setSearch] = useState('');

  return (
    <div className="w-[260px] shrink-0 border-r border-gray-100 bg-white flex flex-col h-full">
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-[13px] font-semibold text-gray-800 mb-2">Мои сценарии</h3>
        <button className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer mb-3">
          <Plus className="w-3.5 h-3.5" />
          Добавить сценарий
        </button>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по номеру"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-[12px] border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-gray-300"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {scenarios
          .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
          .map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => onSelect(scenario.id)}
              className={cn(
                'p-3 rounded-lg cursor-pointer transition-colors border',
                selectedId === scenario.id
                  ? 'bg-blue-50 border-blue-100'
                  : 'border-transparent hover:bg-gray-50'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleScenarioEnabled(crm, scenario.id);
                    }}
                    className={cn(
                      'relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 mt-0.5',
                      scenario.enabled ? 'bg-amber-400' : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-200',
                        scenario.enabled ? 'translate-x-3' : 'translate-x-0'
                      )}
                    />
                  </button>
                  <div className="min-w-0">
                    <p className={cn(
                      'text-[12px] font-medium truncate',
                      selectedId === scenario.id ? 'text-gray-900' : 'text-gray-700'
                    )}>
                      {scenario.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <p className="text-[11px] text-gray-400">
                        для {scenario.count} {scenario.unit}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 cursor-pointer" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function CallSubsection({
  subsection,
  crm,
  scenarioId,
  sectionType,
}: {
  subsection: Scenario['settings']['incoming']['subsections'][0];
  crm: CrmType;
  scenarioId: string;
  sectionType: 'incoming' | 'outgoing';
}) {
  const { activeMode, toggleSetting } = usePrototypeStore();
  const visibleToggles = subsection.toggles.filter(
    (t) => activeMode === 'extended' || t.mode === 'basic'
  );

  return (
    <div className="space-y-1.5">
      <h4 className="text-[13px] font-medium text-gray-700">{subsection.label}</h4>
      <div className="space-y-0.5">
        {visibleToggles.map((toggle) => (
          <CrmToggle
            key={toggle.id}
            setting={toggle}
            disabled={toggle.mode === 'extended' && activeMode === 'basic'}
            onToggle={() => toggleSetting(crm, scenarioId, sectionType, subsection.id, toggle.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CallSectionPanel({
  section,
  crm,
  scenarioId,
  sectionType,
  helpText,
}: {
  section: Scenario['settings']['incoming'];
  crm: CrmType;
  scenarioId: string;
  sectionType: 'incoming' | 'outgoing';
  helpText: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-gray-800">{section.label}</h3>
        <button className="text-[12px] text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 cursor-pointer">
          <CircleHelp className="w-3.5 h-3.5" />
          {helpText}
        </button>
      </div>

      <div className="space-y-4">
        {section.subsections.map((subsection) => (
          <CallSubsection
            key={subsection.id}
            subsection={subsection}
            crm={crm}
            scenarioId={scenarioId}
            sectionType={sectionType}
          />
        ))}
      </div>
    </div>
  );
}

export function Bitrix24Prototype() {
  const {
    bitrix24Scenarios,
    bitrix24Global,
    selectedScenarioId,
    selectScenario,
    toggleGlobal,
    activeMode,
  } = usePrototypeStore();

  const selectedScenario = bitrix24Scenarios.find(
    (s) => s.id === selectedScenarioId.bitrix24
  );

  const visibleGlobal = bitrix24Global.filter(
    (g) => activeMode === 'extended' || g.mode === 'basic'
  );

  if (!selectedScenario) return null;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-gray-900">
            Настройка сценариев обработки звонков сотрудников
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-[12px] text-blue-500 hover:text-blue-600 font-medium cursor-pointer">
            <FolderOpen className="w-3.5 h-3.5" />
            Перейти к резервным копиям
          </button>
          <button className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer">
            <X className="w-4 h-4" />
            Закрыть
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left nav + sidebar */}
        <div className="w-[300px] shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col">
          <div className="p-3">
            <BitrixNavMenu activeItem="scenarios" />
          </div>
          <div className="border-t border-gray-100 mx-3" />
          <BitrixScenarioSidebar
            scenarios={bitrix24Scenarios}
            selectedId={selectedScenarioId.bitrix24}
            onSelect={(id) => selectScenario('bitrix24', id)}
            crm="bitrix24"
          />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[720px] mx-auto p-5 space-y-5">
            {/* Extended settings info block — top */}
            <LockedExtendedBlock crm="bitrix24" scenarioId={selectedScenario.id} />

            {/* Global settings */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[13px] font-semibold text-gray-800">
                  Настройки для всех сценариев
                </h3>
                <button className="flex items-center gap-1 text-[12px] text-blue-500 hover:text-blue-600 font-medium cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Обновить
                </button>
              </div>
              <div className="space-y-0.5">
                {visibleGlobal.map((setting) => (
                  <CrmToggle
                    key={setting.id}
                    setting={setting}
                    disabled={setting.mode === 'extended' && activeMode === 'basic'}
                    onToggle={() => toggleGlobal('bitrix24', setting.id)}
                  />
                ))}
              </div>
            </div>

            {/* Scenario selector */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">
                  Сценарий обработки для {selectedScenario.count} {selectedScenario.unit}
                </span>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                  <span className="text-[13px] font-medium text-gray-800">
                    {selectedScenario.name}
                  </span>
                  <Pencil className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Incoming calls */}
            <div className="border-t border-gray-100 pt-4">
              <CallSectionPanel
                section={selectedScenario.settings.incoming}
                crm="bitrix24"
                scenarioId={selectedScenario.id}
                sectionType="incoming"
                helpText="Как настроить входящие"
              />
            </div>

            {/* Outgoing calls */}
            <div className="border-t border-gray-100 pt-4">
              <CallSectionPanel
                section={selectedScenario.settings.outgoing}
                crm="bitrix24"
                scenarioId={selectedScenario.id}
                sectionType="outgoing"
                helpText="Как настроить исходящие"
              />
            </div>


          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end px-5 py-3 border-t border-gray-100 bg-gray-50/50">
        <button className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer">
          Сохранить и продолжить
        </button>
      </div>
    </div>
  );
}