import type { CSSProperties, ReactNode } from 'react';
import useLanguage from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

function Footer() {
  const { isTibetan, t } = useLanguage();
  return (
    <footer className="bg-kangyur-cream border-t border-kangyur-orange/20 py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-kangyur-dark/70">
            &copy; {new Date().getFullYear()} Kangyur Karchag. All rights reserved.
          </p>
          <p className="text-sm text-kangyur-dark/70 mt-2 sm:mt-0 flex items-center">
            <span className={cn(isTibetan ? 'tibetan' : 'english', 'flex items-center')}>
              {t('madeWithLove.pre')} <Heart className="mx-1 text-kangyur-orange w-4 h-4" /> {t('madeWithLove.post')}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

type StickyFooterShellProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function StickyFooterShell({ children, className, style }: StickyFooterShellProps) {
  return (
    <div className={cn('flex min-h-0 w-full flex-1 flex-col', className)} style={style}>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}

export default Footer;
