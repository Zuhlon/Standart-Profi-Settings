import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CrmType = 'amocrm' | 'bitrix24';
export type ModeType = 'minimal' | 'pro';

export interface ToggleSetting {
  id: string;
  label: string;
  hasInfo?: boolean;
  hasConfigure?: boolean;
  mode: 'minimal' | 'pro';
  enabled: boolean;
}

export interface FunnelSetting {
  id: string;
  label: string;
  funnel: string;
  status: string;
  mode: 'pro';
}

export interface CallSection {
  id: string;
  label: string;
  subsections: {
    id: string;
    label: string;
    toggles: ToggleSetting[];
    funnels?: FunnelSetting[];
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
  setFunnel: (crm: CrmType, scenarioId: string, sectionType: 'incoming' | 'outgoing', subsectionId: string, funnelId: string, field: 'funnel' | 'status', value: string) => void;
  getProConfiguredCount: (crm: CrmType, scenarioId: string) => number;
  toggleScenarioEnabled: (crm: CrmType, id: string) => void;
}

const createDefaultToggles = (isBitrix: boolean): ToggleSetting[] => [
  { id: 'create_contact', label: 'Создать контакт', mode: 'minimal', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'create_company', label: isBitrix ? 'Создать лид' : 'Создать компанию', mode: 'pro', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'create_deal', label: 'Создать сделку', mode: 'minimal', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'create_task_answered', label: 'Создать задачу на ответственный звонок', mode: 'pro', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'create_task_missed', label: 'Создать задачу на пропущенный звонок', mode: 'minimal', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'transfer_recordings', label: 'Передавать записи звонков', mode: 'minimal', enabled: true, hasInfo: true, hasConfigure: true },
  { id: 'transfer_between_employees', label: 'Передавать записи между сотрудниками', mode: 'pro', enabled: true, hasInfo: true, hasConfigure: true },
];

const createFunnelSettings = (hasValues: boolean): FunnelSetting[] => [
  {
    id: 'accepted_funnel',
    label: 'Поместить в воронку Принятый звонок',
    funnel: hasValues ? 'Основная воронка' : '',
    status: hasValues ? 'Новый контакт' : '',
    mode: 'pro',
  },
  {
    id: 'missed_funnel',
    label: 'Поместить в воронку Пропущенный звонок',
    funnel: hasValues ? 'Основная воронка' : '',
    status: hasValues ? 'Пропущенный' : '',
    mode: 'pro',
  },
];

const createCallSection = (type: 'incoming' | 'outgoing', isBitrix: boolean): CallSection => {
  const prefix = type === 'incoming' ? 'С номера' : 'На номер';
  return {
    id: type,
    label: type === 'incoming' ? 'Входящие звонки' : 'Исходящие звонки',
    subsections: [
      {
        id: `${type}_existing`,
        label: `${prefix}, который есть в CRM`,
        toggles: createDefaultToggles(isBitrix),
        funnels: createFunnelSettings(true),
      },
      {
        id: `${type}_new`,
        label: `${prefix}, которого нет в CRM`,
        toggles: createDefaultToggles(isBitrix),
        funnels: createFunnelSettings(false),
      },
    ],
  };
};

const createDefaultScenario = (id: string, name: string, count: number, unit: string, isBitrix: boolean): Scenario => ({
  id,
  name,
  count,
  unit,
  enabled: true,
  settings: {
    incoming: createCallSection('incoming', isBitrix),
    outgoing: createCallSection('outgoing', isBitrix),
  },
});

export const usePrototypeStore = create<PrototypeState>()(
  persist(
    (set, get) => ({
      activeCrm: 'amocrm',
      activeMode: 'minimal',
      selectedScenarioId: { amocrm: 'support', bitrix24: 'scenario1' },

      amocrmScenarios: [
        createDefaultScenario('support', 'Все сотрудники Отдела Поддержки', 2, 'пользователей', false),
        createDefaultScenario('standard', 'Стандартный сценарий', 9, 'пользователей', false),
      ],

      bitrix24Scenarios: [
        createDefaultScenario('scenario1', 'Сценарий 1', 2, 'номеров', true),
        createDefaultScenario('standard', 'Стандартный сценарий', 23, 'номеров', true),
        createDefaultScenario('sales', 'Сценарий Продажи', 25, 'номеров', true),
      ],

      amocrmGlobal: [
        { id: 'forward_manager', label: 'Переводить звонок на ответственного менеджера в CRM', mode: 'minimal', enabled: true, hasInfo: true },
        { id: 'create_undispatched', label: 'Создать сделку в Неразобранное', mode: 'minimal', enabled: false, hasInfo: true },
        { id: 'exceptions', label: 'Номера-исключения', mode: 'pro', enabled: false, hasInfo: true },
      ],

      bitrix24Global: [
        { id: 'forward_manager', label: 'Переводить звонок на ответственного менеджера в CRM', mode: 'minimal', enabled: false, hasInfo: true },
        { id: 'create_contact_deal', label: 'Создать контакт / сделку / лид в начале звонка', mode: 'minimal', enabled: true, hasInfo: true },
        { id: 'exceptions', label: 'Номера-исключения', mode: 'pro', enabled: false, hasInfo: true },
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

      setFunnel: (crm, scenarioId, sectionType, subsectionId, funnelId, field, value) =>
        set((state) => {
          const scenariosKey = crm === 'amocrm' ? 'amocrmScenarios' : 'bitrix24Scenarios';
          const scenarios = state[scenariosKey].map((s) => {
            if (s.id !== scenarioId) return s;
            const section = s.settings[sectionType];
            const updatedSubsections = section.subsections.map((sub) => {
              if (sub.id !== subsectionId) return sub;
              return {
                ...sub,
                funnels: sub.funnels?.map((f) =>
                  f.id === funnelId ? { ...f, [field]: value } : f
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

      getProConfiguredCount: (crm, scenarioId) => {
        const state = get();
        const scenarios = crm === 'amocrm' ? state.amocrmScenarios : state.bitrix24Scenarios;
        const scenario = scenarios.find((s) => s.id === scenarioId);
        if (!scenario) return 0;
        let count = 0;
        const countEnabled = (toggles: ToggleSetting[]) => {
          toggles.forEach((t) => {
            if (t.mode === 'pro' && t.enabled) count++;
          });
        };
        scenario.settings.incoming.subsections.forEach((sub) => countEnabled(sub.toggles));
        scenario.settings.outgoing.subsections.forEach((sub) => countEnabled(sub.toggles));
        return count;
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
      name: 'crm-prototype-state',
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