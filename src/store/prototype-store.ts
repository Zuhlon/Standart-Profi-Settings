import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CrmType = 'amocrm' | 'bitrix24';
export type ModeType = 'basic' | 'extended';

export interface ToggleSetting {
  id: string;
  label: string;
  hasInfo?: boolean;
  hasConfigure?: boolean;
  mode: 'basic' | 'extended';
  enabled: boolean;
}

export interface CallSection {
  id: string;
  label: string;
  subsections: {
    id: string;
    label: string;
    toggles: ToggleSetting[];
  }[];
}

export interface Scenario {
  id: string;
  name: string;
  count: number;
  unit: string;
  enabled: boolean;
  tagsEnabled: boolean;
  isStandard?: boolean;
  settings: {
    incoming: CallSection;
    outgoing: CallSection;
  };
}

export interface Employee {
  id: string;
  name: string;
}

export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'emp1', name: 'Иванов Иван' },
  { id: 'emp2', name: 'Петров Пётр' },
  { id: 'emp3', name: 'Сидорова Анна' },
  { id: 'emp4', name: 'Козлов Дмитрий' },
  { id: 'emp5', name: 'Новикова Елена' },
  { id: 'emp6', name: 'Морозов Андрей' },
  { id: 'emp7', name: 'Волкова Мария' },
];

interface PrototypeState {
  activeCrm: CrmType;
  activeMode: ModeType;
  modeLoading: boolean;
  amocrmScenarios: Scenario[];
  bitrix24Scenarios: Scenario[];
  amocrmGlobal: ToggleSetting[];
  bitrix24Global: ToggleSetting[];
  selectedScenarioId: { amocrm: string; bitrix24: string };

  setCrm: (crm: CrmType) => void;
  setMode: (mode: ModeType) => void;
  selectScenario: (crm: CrmType, id: string) => void;
  toggleGlobal: (crm: CrmType, id: string) => void;
  toggleSetting: (crm: CrmType, scenarioId: string, sectionType: 'incoming' | 'outgoing', subsectionId: string, toggleId: string) => void;
  getExtendedConfiguredToggles: (crm: CrmType, scenarioId: string) => { label: string; enabled: boolean }[];
  toggleScenarioEnabled: (crm: CrmType, id: string) => void;
  toggleScenarioTags: (crm: CrmType, id: string) => void;
  renameScenario: (crm: CrmType, id: string, newName: string) => void;
  duplicateScenario: (crm: CrmType, id: string, newName: string, employeeIds: string[]) => void;
  deleteScenario: (crm: CrmType, id: string) => void;
  createScenario: (crm: CrmType, name: string, employeeIds: string[]) => void;
}

// --- Toggle factories ---

const basicToggles: ToggleSetting[] = [
  { id: 'create_deal', label: 'Создать сделку / лид', mode: 'basic', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'create_task_answered', label: 'Создать задачу на отвеченный звонок', mode: 'basic', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'create_task_missed', label: 'Создать задачу на пропущенный звонок', mode: 'basic', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'transfer_recordings', label: 'Передавать записи звонков', mode: 'basic', enabled: true, hasInfo: true, hasConfigure: true },
];

const extendedTogglesIncomingExisting: ToggleSetting[] = [
  { id: 'transfer_between_employees', label: 'Передавать звонки между сотрудниками', mode: 'extended', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'force_create_lead', label: 'Принудительно создавать лид для всех звонков', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
  { id: 'speech_analytics', label: 'Передавать данные речевой аналитики', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
  { id: 'assign_responsible', label: 'Назначить ответственным за звонок сотрудника, завершившего звонок', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
  { id: 'utm_tag', label: 'Выбрать utm-метку (тег)', mode: 'extended', enabled: false, hasInfo: false, hasConfigure: true },
];

const extendedTogglesIncomingNew: ToggleSetting[] = [
  { id: 'transfer_between_employees', label: 'Передавать звонки между сотрудниками', mode: 'extended', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'speech_analytics', label: 'Передавать данные речевой аналитики', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
  { id: 'assign_responsible', label: 'Назначить ответственным за звонок сотрудника, завершившего звонок', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
  { id: 'utm_tag', label: 'Выбрать utm-метку (тег)', mode: 'extended', enabled: false, hasInfo: false, hasConfigure: true },
];

const extendedTogglesOutgoingExisting: ToggleSetting[] = [
  { id: 'transfer_between_employees', label: 'Передавать звонки между сотрудниками', mode: 'extended', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'force_create_lead', label: 'Принудительно создавать лид для всех звонков', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
  { id: 'speech_analytics', label: 'Передавать данные речевой аналитики', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
];

const extendedTogglesOutgoingNew: ToggleSetting[] = [
  { id: 'transfer_between_employees', label: 'Передавать звонки между сотрудниками', mode: 'extended', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'speech_analytics', label: 'Передавать данные речевой аналитики', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
];

const createCallSection = (type: 'incoming' | 'outgoing'): CallSection => {
  const prefix = type === 'incoming' ? 'С номера' : 'На номер';
  const existingExtended = type === 'incoming' ? extendedTogglesIncomingExisting : extendedTogglesOutgoingExisting;
  const newExtended = type === 'incoming' ? extendedTogglesIncomingNew : extendedTogglesOutgoingNew;
  return {
    id: type,
    label: type === 'incoming' ? 'Входящие звонки' : 'Исходящие звонки',
    subsections: [
      { id: `${type}_existing`, label: `${prefix}, который есть в CRM`, toggles: [...basicToggles, ...existingExtended] },
      { id: `${type}_new`, label: `${prefix}, которого нет в CRM`, toggles: [...basicToggles, ...newExtended] },
    ],
  };
};

const createDefaultScenario = (id: string, name: string, count: number, unit: string, isStandard = false): Scenario => ({
  id, name, count, unit,
  enabled: true, tagsEnabled: false, isStandard,
  settings: { incoming: createCallSection('incoming'), outgoing: createCallSection('outgoing') },
});

export const usePrototypeStore = create<PrototypeState>()(
  persist(
    (set, get) => ({
      activeCrm: 'amocrm',
      activeMode: 'basic',
      modeLoading: false,
      selectedScenarioId: { amocrm: 'support', bitrix24: 'scenario1' },

      amocrmScenarios: [
        createDefaultScenario('support', 'Все сотрудники Отдела Поддержки', 2, 'пользователей'),
        createDefaultScenario('standard', 'Стандартный сценарий', 9, 'пользователей', true),
      ],

      bitrix24Scenarios: [
        createDefaultScenario('scenario1', 'Сценарий 1', 2, 'номеров'),
        createDefaultScenario('standard', 'Стандартный сценарий', 23, 'номеров', true),
        createDefaultScenario('sales', 'Сценарий Продажи', 25, 'номеров'),
      ],

      amocrmGlobal: [
        { id: 'forward_manager', label: 'Переводить звонок на ответственного менеджера в CRM', mode: 'basic', enabled: true, hasInfo: true },
        { id: 'create_undispatched', label: 'Создать сделку в Неразобранное', mode: 'basic', enabled: false, hasInfo: true },
        { id: 'exceptions', label: 'Номера-исключения', mode: 'extended', enabled: false, hasInfo: true },
      ],

      bitrix24Global: [
        { id: 'forward_manager', label: 'Переводить звонок на ответственного менеджера в CRM', mode: 'basic', enabled: false, hasInfo: true },
        { id: 'create_contact_deal', label: 'Создать контакт / сделку / лид в начале звонка', mode: 'basic', enabled: true, hasInfo: true },
        { id: 'exceptions', label: 'Номера-исключения', mode: 'extended', enabled: false, hasInfo: true },
      ],

      setCrm: (crm) => set({ activeCrm: crm }),

      setMode: (mode) => {
        const current = get().activeMode;
        if (current === mode) return;
        set({ modeLoading: true });
        setTimeout(() => {
          set({ activeMode: mode, modeLoading: false });
        }, 2000);
      },

      selectScenario: (crm, id) =>
        set((state) => ({
          selectedScenarioId: { ...state.selectedScenarioId, [crm]: id },
        })),

      toggleGlobal: (crm, id) =>
        set((state) => ({
          [crm === 'amocrm' ? 'amocrmGlobal' : 'bitrix24Global']: (
            crm === 'amocrm' ? state.amocrmGlobal : state.bitrix24Global
          ).map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)),
        })),

      toggleSetting: (crm, scenarioId, sectionType, subsectionId, toggleId) =>
        set((state) => {
          const scenariosKey = crm === 'amocrm' ? 'amocrmScenarios' : 'bitrix24Scenarios';
          const scenarios = state[scenariosKey].map((s) => {
            if (s.id !== scenarioId) return s;
            const section = s.settings[sectionType];
            const updatedSubsections = section.subsections.map((sub) => {
              if (sub.id !== subsectionId) return sub;
              return { ...sub, toggles: sub.toggles.map((t) => t.id === toggleId ? { ...t, enabled: !t.enabled } : t) };
            });
            return { ...s, settings: { ...s.settings, [sectionType]: { ...section, subsections: updatedSubsections } } };
          });
          return { [scenariosKey]: scenarios };
        }),

      getExtendedConfiguredToggles: (crm, scenarioId) => {
        const state = get();
        const scenarios = crm === 'amocrm' ? state.amocrmScenarios : state.bitrix24Scenarios;
        const scenario = scenarios.find((s) => s.id === scenarioId);
        if (!scenario) return [];
        const result: { label: string; enabled: boolean }[] = [];
        const seen = new Set<string>();
        const addExtended = (toggles: ToggleSetting[]) => {
          toggles.forEach((t) => {
            if (t.mode === 'extended' && !seen.has(t.id)) { seen.add(t.id); result.push({ label: t.label, enabled: t.enabled }); }
          });
        };
        scenario.settings.incoming.subsections.forEach((sub) => addExtended(sub.toggles));
        scenario.settings.outgoing.subsections.forEach((sub) => addExtended(sub.toggles));
        return result;
      },

      toggleScenarioEnabled: (crm, id) =>
        set((state) => {
          const scenariosKey = crm === 'amocrm' ? 'amocrmScenarios' : 'bitrix24Scenarios';
          return { [scenariosKey]: state[scenariosKey].map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s) };
        }),

      toggleScenarioTags: (crm, id) =>
        set((state) => {
          const scenariosKey = crm === 'amocrm' ? 'amocrmScenarios' : 'bitrix24Scenarios';
          return { [scenariosKey]: state[scenariosKey].map((s) => s.id === id ? { ...s, tagsEnabled: !s.tagsEnabled } : s) };
        }),

      renameScenario: (crm, id, newName) =>
        set((state) => {
          const scenariosKey = crm === 'amocrm' ? 'amocrmScenarios' : 'bitrix24Scenarios';
          return { [scenariosKey]: state[scenariosKey].map((s) => s.id === id ? { ...s, name: newName } : s) };
        }),

      duplicateScenario: (crm, id, newName, employeeIds) =>
        set((state) => {
          const scenariosKey = crm === 'amocrm' ? 'amocrmScenarios' : 'bitrix24Scenarios';
          const scenarios = state[scenariosKey];
          const source = scenarios.find((s) => s.id === id);
          if (!source) return state;
          const newId = `${id}_copy_${Date.now()}`;
          const copy: Scenario = {
            ...JSON.parse(JSON.stringify(source)),
            id: newId, name: newName, count: employeeIds.length,
            enabled: true, tagsEnabled: false, isStandard: false,
          };
          return {
            [scenariosKey]: [...scenarios, copy],
            selectedScenarioId: { ...state.selectedScenarioId, [crm]: newId },
          };
        }),

      deleteScenario: (crm, id) =>
        set((state) => {
          const scenariosKey = crm === 'amocrm' ? 'amocrmScenarios' : 'bitrix24Scenarios';
          const scenarios = state[scenariosKey];
          const filtered = scenarios.filter((s) => s.id !== id);
          if (filtered.length === 0) return state; // don't delete last
          const currentSelected = state.selectedScenarioId[crm];
          const newSelected = currentSelected === id ? filtered[0].id : currentSelected;
          return {
            [scenariosKey]: filtered,
            selectedScenarioId: { ...state.selectedScenarioId, [crm]: newSelected },
          };
        }),

      createScenario: (crm, name, employeeIds) =>
        set((state) => {
          const scenariosKey = crm === 'amocrm' ? 'amocrmScenarios' : 'bitrix24Scenarios';
          const scenarios = state[scenariosKey];
          const unit = crm === 'amocrm' ? 'пользователей' : 'номеров';
          const newId = `scenario_${Date.now()}`;
          const newScenario: Scenario = {
            id: newId,
            name,
            count: employeeIds.length,
            unit,
            enabled: true,
            tagsEnabled: false,
            isStandard: false,
            settings: {
              incoming: createCallSection('incoming'),
              outgoing: createCallSection('outgoing'),
            },
          };
          return {
            [scenariosKey]: [...scenarios, newScenario],
            selectedScenarioId: { ...state.selectedScenarioId, [crm]: newId },
          };
        }),
    }),
    {
      name: 'crm-prototype-state-v3',
      partialize: (state) => ({
        activeCrm: state.activeCrm,
        activeMode: state.activeMode,
        selectedScenarioId: state.selectedScenarioId,
        amocrmScenarios: state.amocrmScenarios,
        bitrix24Scenarios: state.bitrix24Scenarios,
        amocrmGlobal: state.amocrmGlobal,
        bitrix24Global: state.bitrix24Global,
      }),
    }
  )
);