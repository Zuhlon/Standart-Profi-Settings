'use client';

import { usePrototypeStore, type CrmType } from '@/store/prototype-store';
import { CrmToggle, LockedExtendedBlock } from './CrmToggle';
import { ModeTabs } from './ModeTabs';
import { ScenarioCard, DuplicateModal, DuplicateLoadingModal, DeleteConfirmModal, AddScenarioModal, LoadingOverlay } from './SharedComponents';
import { cn } from '@/lib/utils';
import {
  CircleHelp, X, RefreshCw, Plus, Search, Pencil,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

function ScenarioSidebar({ crm, search, onDuplicate, disabled }: {
  crm: CrmType;
  search: string;
  onDuplicate: (scenarioId: string) => void;
  disabled?: boolean;
}) {
  const { amocrmScenarios, bitrix24Scenarios, selectedScenarioId, selectScenario } = usePrototypeStore();
  const list = crm === 'amocrm' ? amocrmScenarios : bitrix24Scenarios;
  const selectedId = selectedScenarioId[crm];
  const filtered = list.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [loadingDuplicateId, setLoadingDuplicateId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDuplicate = (scenarioId: string) => {
    if (scenarioId === selectedId) {
      // Already loaded — open modal immediately
      setDuplicateId(scenarioId);
    } else {
      // Not loaded — show loading first
      setLoadingDuplicateId(scenarioId);
      timerRef.current = setTimeout(() => {
        setLoadingDuplicateId(null);
        setDuplicateId(scenarioId);
      }, 1500);
    }
  };

  const handleCloseDuplicate = () => {
    setDuplicateId(null);
  };

  // Cleanup timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleDelete = () => {
    if (!deleteId) return;
    const { deleteScenario } = usePrototypeStore.getState();
    deleteScenario(crm, deleteId);
    setDeleteId(null);
  };

  const loadingScenario = loadingDuplicateId ? list.find((s) => s.id === loadingDuplicateId) : null;
  const deleteScenario = deleteId ? list.find((s) => s.id === deleteId) : null;

  return (
    <>
      <div className="w-[260px] shrink-0 border-r border-gray-100 bg-white flex flex-col h-full">
        <div className="p-3 border-b border-gray-100">
          <h3 className="text-[13px] font-semibold text-gray-800 mb-2">Мои сценарии</h3>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Добавить сценарий
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 && (
            <p className="text-[11px] text-gray-400 text-center py-4">Ничего не найдено</p>
          )}
          {filtered.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              selected={selectedId === scenario.id}
              onSelect={() => selectScenario(crm, scenario.id)}
              crm={crm}
              onDuplicate={() => handleDuplicate(scenario.id)}
              onDelete={() => setDeleteId(scenario.id)}
              disabled={disabled}
              duplicateLoading={loadingDuplicateId === scenario.id}
            />
          ))}
        </div>
      </div>

      {loadingScenario && (
        <DuplicateLoadingModal scenarioName={loadingScenario.name} />
      )}

      {deleteScenario && (
        <DeleteConfirmModal
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          crm={crm}
          scenario={deleteScenario}
          onConfirm={handleDelete}
        />
      )}

      <AddScenarioModal open={showAddModal} onClose={() => setShowAddModal(false)} crm={crm} />

      <DuplicateModal
        key={duplicateId}
        open={!!duplicateId}
        onClose={handleCloseDuplicate}
        crm={crm}
        sourceScenario={list.find((s) => s.id === duplicateId)}
      />
    </>
  );
}

function CallSubsection({ subsection, crm, scenarioId, sectionType }: {
  subsection: { id: string; label: string; toggles: { id: string; label: string; hasInfo?: boolean; hasConfigure?: boolean; mode: string; enabled: boolean }[] };
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

function CallSectionPanel({ section, crm, scenarioId, sectionType, helpText }: {
  section: { id: string; label: string; subsections: { id: string; label: string; toggles: any[] }[] };
  crm: CrmType; scenarioId: string; sectionType: 'incoming' | 'outgoing'; helpText: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-gray-800">{section.label}</h3>
        <button className="text-[12px] text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 cursor-pointer">
          <CircleHelp className="w-3.5 h-3.5" />{helpText}
        </button>
      </div>
      <div className="space-y-4">
        {section.subsections.map((sub) => (
          <CallSubsection key={sub.id} subsection={sub} crm={crm} scenarioId={scenarioId} sectionType={sectionType} />
        ))}
      </div>
    </div>
  );
}

function ScenarioSettingsSection({ crm, scenarioId }: { crm: CrmType; scenarioId: string }) {
  const { toggleScenarioTags } = usePrototypeStore();
  const s = usePrototypeStore.getState();
  const scenarios = crm === 'amocrm' ? s.amocrmScenarios : s.bitrix24Scenarios;
  const scenario = scenarios.find((sc) => sc.id === scenarioId);
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
            <span className={cn(
              'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out',
              tagsEnabled ? 'translate-x-4' : 'translate-x-0'
            )} />
          </button>
          <span className="text-[13px] text-gray-800">Теги</span>
          <CircleHelp className="w-3.5 h-3.5 text-gray-400 cursor-help flex-shrink-0" />
        </div>
        <button className="text-[12px] text-blue-500 hover:text-blue-600 font-medium cursor-pointer">Настроить</button>
      </div>
    </div>
  );
}

export function AmoCRMPrototype() {
  const { amocrmScenarios, amocrmGlobal, selectedScenarioId, toggleGlobal, activeMode, modeLoading, selectScenario } = usePrototypeStore();
  const [search, setSearch] = useState('');

  const selectedScenario = amocrmScenarios.find((s) => s.id === selectedScenarioId.amocrm);
  const visibleGlobal = amocrmGlobal.filter((g) => activeMode === 'extended' || g.mode === 'basic');

  // Auto-select first scenario if selected one doesn't exist
  useEffect(() => {
    if (!selectedScenario && amocrmScenarios.length > 0) {
      selectScenario('amocrm', amocrmScenarios[0].id);
    }
  }, [selectedScenario, amocrmScenarios, selectScenario]);

  if (!selectedScenario) return null;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-gray-900">Настройка сценариев обработки звонков сотрудников</h2>
          <CircleHelp className="w-4 h-4 text-gray-400" />
        </div>
        <button className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer">
          <X className="w-4 h-4" />Закрыть
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ScenarioSidebar crm="amocrm" search={search} onDuplicate={() => {}} disabled={modeLoading} />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto relative">
          {modeLoading && <LoadingOverlay />}

          <div className="max-w-[720px] mx-auto p-5 space-y-5">
            {/* Search — above mode tabs */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text" placeholder="Поиск по номеру"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-[12px] border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-gray-300"
              />
            </div>

            {/* Mode tabs — inside scenario */}
            <ModeTabs />

            {/* LockedExtendedBlock */}
            <LockedExtendedBlock crm="amocrm" scenarioId={selectedScenario.id} />

            {/* Global settings */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[13px] font-semibold text-gray-800">Настройки для всех сценариев</h3>
                <button className="flex items-center gap-1 text-[12px] text-blue-500 hover:text-blue-600 font-medium cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5" />Обновить данные
                </button>
              </div>
              <div className="space-y-0.5">
                {visibleGlobal.map((setting) => (
                  <CrmToggle key={setting.id} setting={setting} disabled={setting.mode === 'extended' && activeMode === 'basic'} onToggle={() => toggleGlobal('amocrm', setting.id)} />
                ))}
              </div>
            </div>

            {/* Scenario selector */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">Сценарии обработки для {selectedScenario.count} {selectedScenario.unit}</span>
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

            {/* Incoming */}
            <div className="border-t border-gray-100 pt-4">
              <CallSectionPanel section={selectedScenario.settings.incoming} crm="amocrm" scenarioId={selectedScenario.id} sectionType="incoming" helpText="Как настроить входящие" />
            </div>

            {/* Outgoing */}
            <div className="border-t border-gray-100 pt-4">
              <CallSectionPanel section={selectedScenario.settings.outgoing} crm="amocrm" scenarioId={selectedScenario.id} sectionType="outgoing" helpText="Как настроить исходящие" />
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