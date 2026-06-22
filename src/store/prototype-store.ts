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
  settings: {
    incoming: CallSection;
    outgoing: CallSection;
  };
}

interface PrototypeState {
  activeCrm: CrmType;
  activeMode: ModeType;
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
}

// --- Toggle factories per PDF distribution ---

// Basic toggles (same for all subsections)
const basicToggles: ToggleSetting[] = [
  { id: 'create_deal', label: 'Создать сделку / лид', mode: 'basic', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'create_task_answered', label: 'Создать задачу на отвеченный звонок', mode: 'basic', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'create_task_missed', label: 'Создать задачу на пропущенный звонок', mode: 'basic', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'transfer_recordings', label: 'Передавать записи звонков', mode: 'basic', enabled: true, hasInfo: true, hasConfigure: true },
];

// Extended toggles: incoming_existing (full set)
const extendedTogglesIncomingExisting: ToggleSetting[] = [
  { id: 'transfer_between_employees', label: 'Передавать звонки между сотрудниками', mode: 'extended', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'force_create_lead', label: 'Принудительно создавать лид для всех звонков', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
  { id: 'speech_analytics', label: 'Передавать данные речевой аналитики', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
  { id: 'assign_responsible', label: 'Назначить ответственным за звонок сотрудника, завершившего звонок', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
  { id: 'utm_tag', label: 'Выбрать utm-метку (тег)', mode: 'extended', enabled: false, hasInfo: false, hasConfigure: true },
];

// Extended toggles: incoming_new (no "force_create_lead")
const extendedTogglesIncomingNew: ToggleSetting[] = [
  { id: 'transfer_between_employees', label: 'Передавать звонки между сотрудниками', mode: 'extended', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'speech_analytics', label: 'Передавать данные речевой аналитики', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
  { id: 'assign_responsible', label: 'Назначить ответственным за звонок сотрудника, завершившего звонок', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
  { id: 'utm_tag', label: 'Выбрать utm-метку (тег)', mode: 'extended', enabled: false, hasInfo: false, hasConfigure: true },
];

// Extended toggles: outgoing_existing (no UTM, no Назначить)
const extendedTogglesOutgoingExisting: ToggleSetting[] = [
  { id: 'transfer_between_employees', label: 'Передавать звонки между сотрудниками', mode: 'extended', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'force_create_lead', label: 'Принудительно создавать лид для всех звонков', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
  { id: 'speech_analytics', label: 'Передавать данные речевой аналитики', mode: 'extended', enabled: false, hasInfo: true, hasConfigure: true },
];

// Extended toggles: outgoing_new (minimal)
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
      {
        id: `${type}_existing`,
        label: `${prefix}, который есть в CRM`,
        toggles: [...basicToggles, ...existingExtended],
      },
      {
        id: `${type}_new`,
        label: `${prefix}, которого нет в CRM`,
        toggles: [...basicToggles, ...newExtended],
      },
    ],
  };
};

const createDefaultScenario = (id: string, name: string, count: number, unit: string): Scenario => ({
  id,
  name,
  count,
  unit,
  enabled: true,
  settings: {
    incoming: createCallSection('incoming'),
    outgoing: createCallSection('outgoing'),
  },
});

export const usePrototypeStore = create<PrototypeState>()(
  persist(
    (set, get) => ({
      activeCrm: 'amocrm',
      activeMode: 'basic',
      selectedScenarioId: { amocrm: 'support', bitrix24: 'scenario1' },

      amocrmScenarios: [
        createDefaultScenario('support', 'Все сотрудники Отдела Поддержки', 2, 'пользователей'),
        createDefaultScenario('standard', 'Стандартный сценарий', 9, 'пользователей'),
      ],

      bitrix24Scenarios: [
        createDefaultScenario('scenario1', 'Сценарий 1', 2, 'номеров'),
        createDefaultScenario('standard', 'Стандартный сценарий', 23, 'номеров'),
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
      setMode: (mode) => set({ activeMode: mode }),

      selectScenario: (crm, id) =>
        set((state) => ({
          selectedScenarioId: {
            ...state.selectedScenarioId,
            [crm]: id,
          },
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
              return {
                ...sub,
                toggles: sub.toggles.map((t) =>
                  t.id === toggleId ? { ...t, enabled: !t.enabled } : t
                ),
              };
            });
            return {
              ...s,
              settings: { ...s.settings, [sectionType]: { ...section, subsections: updatedSubsections } },
            };
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
            if (t.mode === 'extended' && !seen.has(t.id)) {
              seen.add(t.id);
              result.push({ label: t.label, enabled: t.enabled });
            }
          });
        };
        scenario.settings.incoming.subsections.forEach((sub) => addExtended(sub.toggles));
        scenario.settings.outgoing.subsections.forEach((sub) => addExtended(sub.toggles));
        return result;
      },

      toggleScenarioEnabled: (crm, id) =>
        set((state) => {
          const scenariosKey = crm === 'amocrm' ? 'amocrmScenarios' : 'bitrix24Scenarios';
          return {
            [scenariosKey]: state[scenariosKey].map((s) =>
              s.id === id ? { ...s, enabled: !s.enabled } : s
            ),
          };
        }),
    }),
    {
      name: 'crm-prototype-state-v2',
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