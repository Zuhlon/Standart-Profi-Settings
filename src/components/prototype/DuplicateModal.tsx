'use client';

import { useState } from 'react';
import { X, Check, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  avatar: string;
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Иванов Алексей', avatar: 'ИА' },
  { id: 'e2', name: 'Петрова Мария', avatar: 'ПМ' },
  { id: 'e3', name: 'Сидоров Дмитрий', avatar: 'СД' },
  { id: 'e4', name: 'Козлова Анна', avatar: 'КА' },
  { id: 'e5', name: 'Новиков Сергей', avatar: 'НС' },
  { id: 'e6', name: 'Морозова Елена', avatar: 'МЕ' },
];

interface DuplicateModalProps {
  sourceName: string;
  onConfirm: (name: string, employeeIds: string[]) => void;
  onCancel: () => void;
}

export function DuplicateModal({ sourceName, onConfirm, onCancel }: DuplicateModalProps) {
  const [name, setName] = useState(`${sourceName} — копия`);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'employees' | 'naming'>('employees');

  const toggleEmployee = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canProceed = step === 'employees' ? selected.size > 0 : name.trim().length > 0;

  const handleNext = () => {
    if (step === 'employees' && selected.size > 0) setStep('naming');
  };

  const handleBack = () => setStep('employees');

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim(), Array.from(selected));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-[420px] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <h3 className="text-[14px] font-semibold text-gray-900">
              {step === 'employees' ? 'Выберите сотрудников' : 'Название сценария'}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {step === 'employees' ? (
          <>
            {/* Employee list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <p className="text-[12px] text-gray-500 mb-3">
                Выберите сотрудников, для которых будет создана копия сценария
              </p>
              {MOCK_EMPLOYEES.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => toggleEmployee(emp.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left',
                    selected.has(emp.id)
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0',
                    selected.has(emp.id) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  )}>
                    {emp.avatar}
                  </div>
                  <span className={cn(
                    'text-[13px]',
                    selected.has(emp.id) ? 'text-gray-900 font-medium' : 'text-gray-700'
                  )}>
                    {emp.name}
                  </span>
                  {selected.has(emp.id) && (
                    <Check className="w-4 h-4 text-blue-500 ml-auto" />
                  )}
                </button>
              ))}
              {selected.size > 0 && (
                <p className="text-[11px] text-gray-400 pt-2">
                  Выбрано: {selected.size}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-[13px] text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={cn(
                  'px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors',
                  canProceed
                    ? 'bg-amber-400 hover:bg-amber-500 text-gray-900 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                Далее
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Naming step */}
            <div className="p-5 space-y-4">
              <p className="text-[12px] text-gray-500">
                Введите название для нового сценария
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && canProceed && handleConfirm()}
                className="w-full h-10 px-3 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-400"
                placeholder="Название сценария"
              />
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Users className="w-3.5 h-3.5" />
                <span>Для {selected.size} сотрудник(ов)</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-[13px] text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
              >
                Назад
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canProceed}
                className={cn(
                  'px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors',
                  canProceed
                    ? 'bg-amber-400 hover:bg-amber-500 text-gray-900 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                Готово
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}