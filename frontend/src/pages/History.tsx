import { StickyFooterShell } from '@/components/ui/molecules/Footer';
import Timeline from '@/components/ui/molecules/Timeline';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const History = () => {
  const {t,isTibetan}=useLanguage()

  return (
    <StickyFooterShell>
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-kangyur-maroon">
              <span className={cn(isTibetan ? 'tibetan' : 'english')}>{t('historyTitle')}</span>
            </h1>
          </div>

          <Timeline />
        </div>
      </main>
    </StickyFooterShell>
  );
};

export default History;