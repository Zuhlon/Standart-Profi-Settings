'use client';

import { CrmTabs, ModeTabs } from '@/components/prototype/ModeTabs';
import { AmoCRMPrototype } from '@/components/prototype/AmoCRM';
import { Bitrix24Prototype } from '@/components/prototype/Bitrix24';
import { usePrototypeStore } from '@/store/prototype-store';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export default function Home() {
  const { activeCrm, activeMode } = usePrototypeStore();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-[14px] font-bold text-gray-900 tracking-tight">
              Прототип: Настройки обработки звонков
            </h1>
            <CrmTabs />
          </div>
          <ModeTabs />
        </div>
        {/* Mode indicator bar */}
        <div className="max-w-[1400px] mx-auto px-4">
          <div className={`h-0.5 ${activeMode === 'extended' ? 'bg-gradient-to-r from-sky-400 via-violet-400 to-amber-400' : 'bg-gradient-to-r from-amber-300 to-amber-400'}`} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-4">
        {activeCrm === 'amocrm' ? <AmoCRMPrototype /> : <Bitrix24Prototype />}
      </main>
    </div>
  );
}