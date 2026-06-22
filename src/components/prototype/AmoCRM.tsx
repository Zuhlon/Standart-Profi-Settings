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
  Check,
} from 'lucide-react';
import { useState, useRef, useEffect, KeyboardEvent } from 'react';

function ScenarioCard({ scenario, selected, onSelect, crm }: {
  scenario: Scenario;
  selected: boolean;
  onSelect: () => void;
  crm: CrmType;
}) {
  const { toggleScenarioEnabled, renameScenario } = usePrototypeStore();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(scenario.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setEditName(scenario.name);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, scenario.name]);

  const handleSave = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== scenario.name) {
      renameScenario(crm, scenario.id, trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-3 rounded-lg cursor-pointer transition-colors border',
        selected
          ? 'bg-blue-50 border-blue-100'
          : 'border-transparent hover:bg-gray-50'
      )}
    >
      {/* Top row: toggle + name */}
      <div className="flex items-start gap-2">
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
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-[12px] font-medium text-gray-900 bg-white border border-blue-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-blue-400"
            />
          ) : (
            <p className={cn(
              'text-[12px] font-medium truncate',
              selected ? 'text-gray-900' : 'text-gray-700'
            )}>
              {scenario.name}
            </p>
          )}
          <p className="text-[11px] text-gray-400 mt-0.5">
            для {scenario.count} {scenario.unit}
          </p>
        </div>
      </div>

      {/* Bottom row: action icons */}
      <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-gray-100/80">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (editing) handleSave();
            else setEditing(true);
          }}
          className="p-1 rounded hover:bg-gray-200/60 transition-colors cursor-pointer"
          title="Переименовать"
        >
          {editing ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
          title="Удалить"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
}

function ScenarioSidebar({ scenarios, selectedId, onSelect, crm, search }: {
  scenarios: Scenario[];
  selectedId: string;
  onSelect: (id: string) => void;
  crm: CrmType;
  search: string;
}) {
  const filtered = scenarios.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-[260px] shrink-0 border-r border-gray-100 bg-white flex flex-col h-full">
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-[13px] font-semibold text-gray-800 mb-2">Мои сценарии</h3>
        <button className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          Добавить сценарий
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            selected={selectedId === scenario.id}
            onSelect={() => onSelect(scenario.id)}
            crm={crm}
          />
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

function ScenarioSettingsSection({ crm, scenarioId }: { crm: CrmType; scenarioId: string }) {
  const { toggleScenarioTags } = usePrototypeStore();
  const scenarios = crm === 'amocrm' ? usePrototypeStore.getState().amocrmScenarios : usePrototypeStore.getState().bitrix24Scenarios;
  const scenario = scenarios.find((s) => s.id === scenarioId);
  const tagsEnabled = scenario?.tagsEnabled ?? false;

  return (
    <div className="space-y-2">
      <h3 className="text-[13px] font-semibold text-gray-800">Настройки сценария</h3>
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleScenarioTags(crm, scenarioId)}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              tagsEnabled ? 'bg-amber-400' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out',
                tagsEnabled ? 'translate-x-4' : 'translate-x-0'
              )}
            />
          </button>
          <span className="text-[13px] text-gray-800">Теги</span>
          <CircleHelp className="w-3.5 h-3.5 text-gray-400 cursor-help flex-shrink-0" />
        </div>
        <button className="text-[12px] text-blue-500 hover:text-blue-600 font-medium cursor-pointer">
          Настроить
        </button>
      </div>
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

  const [search, setSearch] = useState('');

  const selectedScenario = amocrmScenarios.find(
    (s) => s.id === selectedScenarioId.amocrm
  );

  const visibleGlobal = amocrmGlobal.filter(
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
          <CircleHelp className="w-4 h-4 text-gray-400" />
        </div>
        <button className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer">
          <X className="w-4 h-4" />
          Закрыть
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — scenarios only, no search */}
        <ScenarioSidebar
          scenarios={amocrmScenarios}
          selectedId={selectedScenarioId.amocrm}
          onSelect={(id) => selectScenario('amocrm', id)}
          crm="amocrm"
          search={search}
        />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[720px] mx-auto p-5 space-y-5">
            {/* Extended settings info block */}
            <LockedExtendedBlock crm="amocrm" scenarioId={selectedScenario.id} />

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
                {visibleGlobal.map((setting) => (
                  <CrmToggle
                    key={setting.id}
                    setting={setting}
                    disabled={setting.mode === 'extended' && activeMode === 'basic'}
                    onToggle={() => toggleGlobal('amocrm', setting.id)}
                  />
                ))}
              </div>
            </div>

            {/* Search across all scenarios */}
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

            {/* Scenario selector */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">
                  Сценарии обработки для {selectedScenario.count} {selectedScenario.unit}
                </span>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                  <span className="text-[13px] font-medium text-gray-800">{selectedScenario.name}</span>
                  <Pencil className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Scenario settings / Tags */}
            <div className="border-t border-gray-100 pt-4">
              <ScenarioSettingsSection crm="amocrm" scenarioId={selectedScenario.id} />
            </div>

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