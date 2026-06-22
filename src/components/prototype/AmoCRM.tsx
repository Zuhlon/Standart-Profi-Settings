'use client';

import { usePrototypeStore, type Scenario, type CrmType } from '@/store/prototype-store';
import { CrmToggle, FunnelRow, LockedProSection } from './CrmToggle';
import { cn } from '@/lib/utils';
import {
  CircleHelp,
  X,
  RefreshCw,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

function ScenarioSidebar({ scenarios, selectedId, onSelect, crm }: {
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
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      для {scenario.count} {scenario.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
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
  const { activeMode, toggleSetting, setFunnel } = usePrototypeStore();
  const minimalToggles = subsection.toggles.filter((t) => t.mode === 'minimal');
  const proToggles = subsection.toggles.filter((t) => t.mode === 'pro');
  const hasFunnelSettings = subsection.funnels && subsection.funnels.length > 0;
  const hasProSettings = proToggles.length > 0 || hasFunnelSettings;

  return (
    <div className="space-y-2">
      <h4 className="text-[13px] font-medium text-gray-700">{subsection.label}</h4>

      {/* Minimal toggles - always shown */}
      <div className="space-y-0.5">
        {minimalToggles.map((toggle) => (
          <CrmToggle
            key={toggle.id}
            setting={toggle}
            disabled={false}
            onToggle={() => toggleSetting(crm, scenarioId, sectionType, subsection.id, toggle.id)}
          />
        ))}
      </div>

      {/* Pro toggles and funnels - collapsed in minimal mode */}
      {activeMode === 'pro' ? (
        <>
          <div className="space-y-0.5 mt-1">
            {proToggles.map((toggle) => (
              <CrmToggle
                key={toggle.id}
                setting={toggle}
                disabled={false}
                onToggle={() => toggleSetting(crm, scenarioId, sectionType, subsection.id, toggle.id)}
              />
            ))}
          </div>
          {hasFunnelSettings && subsection.funnels && (
            <div className="mt-2 space-y-2 pl-1">
              <div className="flex items-center gap-1.5">
                <CircleHelp className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[12px] font-medium text-gray-600">Работа с воронками</span>
              </div>
              {subsection.funnels.map((funnel) => (
                <FunnelRow
                  key={funnel.id}
                  funnel={funnel}
                  onFunnelChange={(field, value) =>
                    setFunnel(crm, scenarioId, sectionType, subsection.id, funnel.id, field, value)
                  }
                />
              ))}
            </div>
          )}
        </>
      ) : hasProSettings ? null : null}
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
  const { activeMode } = usePrototypeStore();
  const hasProToggles = section.subsections.some((sub) =>
    sub.toggles.some((t) => t.mode === 'pro')
  );
  const hasFunnels = section.subsections.some((sub) => sub.funnels && sub.funnels.length > 0);
  const showLocked = activeMode === 'minimal' && (hasProToggles || hasFunnels);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-gray-800">{section.label}</h3>
        <button className="text-[12px] text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 cursor-pointer">
          <CircleHelp className="w-3.5 h-3.5" />
          {helpText}
        </button>
      </div>

      {section.subsections.map((subsection) => (
        <CallSubsection
          key={subsection.id}
          subsection={subsection}
          crm={crm}
          scenarioId={scenarioId}
          sectionType={sectionType}
        />
      ))}

      {showLocked && (
        <LockedProSection
          crm={crm}
          scenarioId={scenarioId}
          title="Расширенные настройки сценария"
        />
      )}
    </div>
  );
}

export function AmoCRMPrototype() {
  const {
    amocrmScenarios,
    amocrmGlobal,
    selectedScenarioId,
    selectScenario,
    toggleGlobal,
    activeMode,
  } = usePrototypeStore();

  const selectedScenario = amocrmScenarios.find(
    (s) => s.id === selectedScenarioId.amocrm
  );

  const minimalGlobal = amocrmGlobal.filter((g) => g.mode === 'minimal');
  const proGlobal = amocrmGlobal.filter((g) => g.mode === 'pro');

  if (!selectedScenario) return null;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-gray-900">
            Настройка сценариев обработки звонков сотрудников
          </h2>
          <CircleHelp className="w-4 h-4 text-gray-400" />
        </div>
        <button className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer">
          <X className="w-4 h-4" />
          Закрыть
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ScenarioSidebar
          scenarios={amocrmScenarios}
          selectedId={selectedScenarioId.amocrm}
          onSelect={(id) => selectScenario('amocrm', id)}
          crm="amocrm"
        />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[720px] mx-auto p-5 space-y-5">
            {/* Global settings */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[13px] font-semibold text-gray-800">
                  Настройки для всех сценариев
                </h3>
                <button className="flex items-center gap-1 text-[12px] text-blue-500 hover:text-blue-600 font-medium cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Обновить данные
                </button>
              </div>
              <div className="space-y-0.5">
                {minimalGlobal.map((setting) => (
                  <CrmToggle
                    key={setting.id}
                    setting={setting}
                    disabled={false}
                    onToggle={() => toggleGlobal('amocrm', setting.id)}
                  />
                ))}
              </div>
              {activeMode === 'minimal' && proGlobal.length > 0 && (
                <LockedProSection
                  crm="amocrm"
                  scenarioId={selectedScenario.id}
                  title="Дополнительные глобальные настройки"
                />
              )}
              {activeMode === 'pro' && (
                <div className="space-y-0.5 mt-1">
                  {proGlobal.map((setting) => (
                    <CrmToggle
                      key={setting.id}
                      setting={setting}
                      disabled={false}
                      onToggle={() => toggleGlobal('amocrm', setting.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Scenario selector */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">
                    Сценарии обработки для {selectedScenario.count} {selectedScenario.unit}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                  <span className="text-[13px] font-medium text-gray-800">{selectedScenario.name}</span>
                  <Pencil className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Scenario settings: Tags */}
            {activeMode === 'pro' && (
              <div>
                <h3 className="text-[13px] font-semibold text-gray-800 mb-2">Настройки сценария</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative inline-flex h-5 w-9 cursor-pointer rounded-full bg-gray-300 border-2 border-transparent">
                      <span className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform translate-x-0" />
                    </div>
                    <span className="text-[13px] text-gray-800">Теги</span>
                    <CircleHelp className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <button className="text-[12px] text-blue-500 hover:text-blue-600 font-medium flex items-center gap-0.5 cursor-pointer">
                    Настроить <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
            {activeMode === 'minimal' && (
              <LockedProSection
                crm="amocrm"
                scenarioId={selectedScenario.id}
                title="Теги и расширенные настройки сценария"
              />
            )}

            {/* Incoming calls */}
            <div className="border-t border-gray-100 pt-4">
              <CallSectionPanel
                section={selectedScenario.settings.incoming}
                crm="amocrm"
                scenarioId={selectedScenario.id}
                sectionType="incoming"
                helpText="Как настроить входящие"
              />
            </div>

            {/* Outgoing calls */}
            <div className="border-t border-gray-100 pt-4">
              <CallSectionPanel
                section={selectedScenario.settings.outgoing}
                crm="amocrm"
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