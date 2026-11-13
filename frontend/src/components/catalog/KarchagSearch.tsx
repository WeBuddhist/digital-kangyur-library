import React, { useState, useEffect, KeyboardEvent } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import useLanguage from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const KarchagSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isTibetan } = useLanguage();

  const urlQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlQuery);

  useEffect(() => {
    if (location.pathname === '/search') {
      setSearchQuery(urlQuery);
    }
  }, [urlQuery, location.pathname]);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div
      className={cn('relative py-10 sm:py-12 overflow-hidden text-white', isTibetan ? 'font-tibetan' : 'font-sans')}
      style={{ backgroundColor: '#e3821b' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <div
            className={cn(
              'flex rounded-2xl bg-white shadow-lg shadow-black/10',
              'ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-white/80 transition-shadow'
            )}
          >
            <input
              type="search"
              className="flex-1 min-w-0 rounded-l-2xl border-0 bg-transparent py-3.5 pl-4 pr-2 text-kangyur-dark placeholder:text-stone-400 focus:outline-none focus:ring-0 text-base"
              placeholder={t('searchCatalogPlaceholder') || 'Search titles, sections, IDs…'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={t('searchCatalogPlaceholder') || 'Search catalog'}
            />
            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center gap-2 rounded-r-2xl bg-kangyur-dark px-5 py-3.5 text-sm font-semibold text-white hover:bg-kangyur-dark/90 transition-colors"
            >
              <Search className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              <span className="hidden sm:inline">{t('search') || 'Search'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KarchagSearch;
