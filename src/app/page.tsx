'use client';

import { CrmTabs } from '@/components/prototype/ModeTabs';
import { AmoCRMPrototype } from '@/components/prototype/AmoCRM';
import { Bitrix24Prototype } from '@/components/prototype/Bitrix24';
import { usePrototypeStore } from '@/store/prototype-store';

export default function Home() {
  const { activeCrm } = usePrototypeStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-[14px] font-bold text-gray-900 tracking-tight">
              Прототип: Настройки обработки звонков
            </h1>
            <CrmTabs />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-4">
        {activeCrm === 'amocrm' ? <AmoCRMPrototype /> : <Bitrix24Prototype />}
      </main>
    </div>
  );
}