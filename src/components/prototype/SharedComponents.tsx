'use client';

import { useState } from 'react';
import { usePrototypeStore, type CrmType, type Scenario, MOCK_EMPLOYEES } from '@/store/prototype-store';
import { cn } from '@/lib/utils';
import { Copy, Trash2, X, Check, User, Loader2, AlertTriangle } from 'lucide-react';

/* ─── Add Scenario Modal ─── */

export function AddScenarioModal({ open, onClose, crm }: {
  open: boolean;
  onClose: () => void;
  crm: CrmType;
}) {
  const { createScenario } = usePrototypeStore();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  if (!open) return null;

  const toggleEmployee = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  };

  const canSubmit = name.trim().length > 0 && selected.length > 0;

  const handleDone = () => {
    if (!canSubmit) return;
    createScenario(crm, name.trim(), selected);
    setName('');
    setSelected([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-[420px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-semibold text-gray-900">Новый сценарий</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Название сценария</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название"
              className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              autoFocus
            />
          </div>

          {/* Employee selection */}
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
              Сотрудники
              {selected.length > 0 && (
                <span className="ml-1.5 text-[11px] text-blue-500 font-normal">
                  Выбрано: {selected.length}
                </span>
              )}
            </label>
            <div className="border border-gray-200 rounded-lg max-h-[220px] overflow-y-auto">
              {MOCK_EMPLOYEES.map((emp) => (
                <label
                  key={emp.id}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors',
                    selected.includes(emp.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(emp.id)}
                    onChange={() => toggleEmployee(emp.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                  />
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-[13px] text-gray-700">{emp.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
          >
            Отмена
          </button>
          <button
            onClick={handleDone}
            disabled={!canSubmit}
            className={cn(
              'px-5 py-2 text-[13px] font-semibold rounded-lg transition-colors flex items-center gap-1.5',
              canSubmit
                ? 'bg-amber-400 hover:bg-amber-500 text-gray-900 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            <Check className="w-4 h-4" />
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Duplicate Modal ─── */

export function DuplicateModal({ open, onClose, crm, sourceScenario }: {
  open: boolean;
  onClose: () => void;
  crm: CrmType;
  sourceScenario: Scenario | undefined;
}) {
  const { duplicateScenario } = usePrototypeStore();
  const [name, setName] = useState(() => sourceScenario ? `${sourceScenario.name} (копия)` : '');
  const [selected, setSelected] = useState<string[]>([]);

  if (!open || !sourceScenario) return null;

  const toggleEmployee = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  };

  const canSubmit = name.trim().length > 0 && selected.length > 0;

  const handleDone = () => {
    if (!canSubmit) return;
    duplicateScenario(crm, sourceScenario.id, name.trim(), selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-[420px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-semibold text-gray-900">Дублировать сценарий</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Название сценария</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название"
              className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              autoFocus
            />
          </div>

          {/* Employee selection */}
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
              Сотрудники
              {selected.length > 0 && (
                <span className="ml-1.5 text-[11px] text-blue-500 font-normal">
                  Выбрано: {selected.length}
                </span>
              )}
            </label>
            <div className="border border-gray-200 rounded-lg max-h-[220px] overflow-y-auto">
              {MOCK_EMPLOYEES.map((emp) => (
                <label
                  key={emp.id}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors',
                    selected.includes(emp.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(emp.id)}
                    onChange={() => toggleEmployee(emp.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                  />
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-[13px] text-gray-700">{emp.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
          >
            Отмена
          </button>
          <button
            onClick={handleDone}
            disabled={!canSubmit}
            className={cn(
              'px-5 py-2 text-[13px] font-semibold rounded-lg transition-colors flex items-center gap-1.5',
              canSubmit
                ? 'bg-amber-400 hover:bg-amber-500 text-gray-900 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            <Check className="w-4 h-4" />
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Duplicate Loading Modal ─── */

export function DuplicateLoadingModal({ scenarioName }: { scenarioName: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative bg-white rounded-xl shadow-xl w-[320px] py-8 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        <p className="text-[13px] text-gray-600 text-center">
          Загрузка настроек сценария<br />
          <span className="font-medium text-gray-800">«{scenarioName}»</span>
        </p>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ─── */

export function DeleteConfirmModal({ open, onClose, crm, scenario, onConfirm }: {
  open: boolean;
  onClose: () => void;
  crm: CrmType;
  scenario: Scenario | undefined;
  onConfirm: () => void;
}) {
  if (!open || !scenario) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-[380px] flex flex-col">
        <div className="px-5 py-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-gray-900">Удалить сценарий?</h3>
              <p className="text-[13px] text-gray-500 mt-1">
                Сценарий <span className="font-medium text-gray-700">«{scenario.name}»</span> будет удалён без возможности восстановления.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
          >
            Отмена
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="px-5 py-2 text-[13px] font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared Scenario Card ─── */

export function ScenarioCard({ scenario, selected, onSelect, crm, onDuplicate, onDelete, disabled, duplicateLoading }: {
  scenario: Scenario;
  selected: boolean;
  onSelect: () => void;
  crm: CrmType;
  onDuplicate: () => void;
  onDelete: () => void;
  disabled?: boolean;
  duplicateLoading?: boolean;
}) {
  const { toggleScenarioEnabled } = usePrototypeStore();

  return (
    <div
      onClick={disabled || duplicateLoading ? undefined : onSelect}
      className={cn(
        'p-3 rounded-lg transition-colors border',
        selected ? 'bg-blue-50 border-blue-100' : 'border-transparent',
        disabled || duplicateLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
      )}
    >
      {/* Top row: toggle + name */}
      <div className="flex items-start gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); if (!disabled && !duplicateLoading) toggleScenarioEnabled(crm, scenario.id); }}
          disabled={disabled || duplicateLoading}
          className={cn(
            'relative inline-flex h-4 w-7 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 mt-0.5',
            scenario.enabled ? 'bg-amber-400' : 'bg-gray-300',
            (disabled || duplicateLoading) ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          <span className={cn(
            'pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-200',
            scenario.enabled ? 'translate-x-3' : 'translate-x-0'
          )} />
        </button>
        <div className="min-w-0 flex-1">
          <p className={cn(
            'text-[12px] font-medium truncate',
            selected ? 'text-gray-900' : 'text-gray-700'
          )}>
            {scenario.name}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            для {scenario.count} {scenario.unit}
          </p>
        </div>
      </div>

      {/* Bottom row: actions (hidden for standard) */}
      {!scenario.isStandard && (
        <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-gray-100/80">
          <button
            onClick={(e) => { e.stopPropagation(); if (!disabled && !duplicateLoading) onDuplicate(); }}
            disabled={disabled || duplicateLoading}
            className={cn('p-1 rounded transition-colors', (disabled || duplicateLoading) ? 'cursor-not-allowed' : 'hover:bg-gray-200/60 cursor-pointer')}
            title="Дублировать"
          >
            {duplicateLoading ? (
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            ) : (
              <Copy className={cn('w-3.5 h-3.5', disabled ? 'text-gray-300' : 'text-gray-400 hover:text-blue-500')} />
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (!disabled && !duplicateLoading) onDelete(); }}
            disabled={disabled || duplicateLoading}
            className={cn('p-1 rounded transition-colors', (disabled || duplicateLoading) ? 'cursor-not-allowed' : 'hover:bg-red-50 cursor-pointer')}
            title="Удалить"
          >
            <Trash2 className={cn('w-3.5 h-3.5', (disabled || duplicateLoading) ? 'text-gray-300' : 'text-gray-400 hover:text-red-500')} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Loading Overlay ─── */

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-40 bg-white/80 flex items-center justify-center backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-[12px] text-gray-500">Загрузка настроек...</span>
      </div>
    </div>
  );
}