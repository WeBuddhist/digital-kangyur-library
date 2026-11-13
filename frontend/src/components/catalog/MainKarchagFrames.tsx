import React from 'react';
import { useQuery } from '@tanstack/react-query';
import KarchagFrame from './KarchagFrame';
import KarchagSearch from './KarchagSearch';
import api from '@/utils/api';
import useLanguage from '@/hooks/useLanguage';

const MainKarchagFrames: React.FC = () => {
  const { isTibetan, t } = useLanguage();
  // Fetch karchag main categories
  const { data: categoriesData = [], isLoading } = useQuery({
    queryKey: ['karchag', 'main-categories', { is_active: 'true' }],
    queryFn: async () => {
      const response = await api.getKarchagMainCategories({ is_active: 'true' });
      return response.categories || [];
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <KarchagSearch />
      <div className="container mx-auto px-4 pt-8 pb-12 min-h-[60vh]">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-4 ${isTibetan ? 'tibetan' : ''}`}>{t('catalog')}</h2>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-10 md:gap-24 flex-wrap">
          {categoriesData.map((category: any) => (
            <KarchagFrame 
              key={category.id}
              label={{
                tibetan: category.name_tibetan || '',
                english: category.name_english || ''
              }}
              fontSize="xx-large"
              link={`/catalog?category=${encodeURIComponent(category.id)}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default MainKarchagFrames;
