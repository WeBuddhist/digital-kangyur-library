import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/atoms/card';
import { Button } from '@/components/ui/atoms/button';
import { Input } from '@/components/ui/atoms/input';
import { NewsForm } from '@/components/admin/news/CreateNewsForm';
import { NewsEntry } from '@/types/news';
import { Edit, Trash2, Calendar, Search, Plus } from 'lucide-react';
import api from '@/utils/api';
import useLanguage from '@/hooks/useLanguage';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { useServerPagedList } from '@/hooks/useServerPagedList';

const NEWS_PER_PAGE = 12;

const toNewsEntry = (item: any): NewsEntry => ({
  id: item.id,
  tibetanTitle: item.title?.tibetan || '',
  englishTitle: item.title?.english || '',
  tibetanDescription: item.description?.tibetan || '',
  englishDescription: item.description?.english || '',
  createdAt: item.published_at || item.created_at,
  thumbnailUrl: item.thumbnail_url || '',
});

const NewsCard = ({
  news,
  onEdit,
  onDelete
}: {
  news: NewsEntry;
  onEdit: (news: NewsEntry) => void;
  onDelete: (id: string) => void;
}) => {
  const { isTibetan, t } = useLanguage();
  return <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
      <div className="overflow-hidden h-48">
        <img src={news.thumbnailUrl || "https://images.unsplash.com/photo-1598499255807-87188c4eda38?q=80&w=2574&auto=format&fit=crop"} alt={news.englishTitle} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
      </div>
      <CardHeader className="pb-2">
        {isTibetan && news.tibetanTitle ? (
          <p className="text-sm font-medium text-kangyur-maroon tibetan mb-1">{news.tibetanTitle}</p>
        ) : (
          <CardTitle className="text-lg">{news.englishTitle}</CardTitle>
        )}
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        {isTibetan && news.tibetanDescription ? (
          <p className="text-muted-foreground text-sm mb-3">{news.tibetanDescription?.slice(0, 100)}...</p>
        ) : (
          <p className="text-muted-foreground text-sm mb-3">{news.englishDescription?.slice(0, 100)}...</p>
        )}
        <div className="flex items-center text-xs text-kangyur-dark/60">
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          {new Date(news.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center gap-2 w-full">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(news)}>
            <Edit className="h-4 w-4 mr-2" />
            {t('edit')}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-red-600 hover:text-red-700"
            onClick={() => onDelete(news.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('delete')}
          </Button>
        </div>
      </CardFooter>
    </Card>;
};

const NewsAdmin = () => {
  const { t ,isTibetan} = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsEntry | null>(null);
  const {
    items: newsEntries,
    total,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    isSearching,
    loading,
    reload,
  } = useServerPagedList<NewsEntry>(
    async (page, limit, search) => {
      const response = await api.getNews({ page, limit, search });
      return { items: response.news.map(toNewsEntry), total: response.pagination?.total ?? 0 };
    },
    { pageSize: NEWS_PER_PAGE, onError: (error) => console.error('Failed to fetch news:', error) }
  );

  const handleEdit = (news: NewsEntry) => {
    setEditingNews(news);
    setIsFormOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingNews) {
        // Update existing news
        await api.updateNews(editingNews.id, {
          tibetan_title: data.tibetan_title,
          english_title: data.english_title,
          tibetan_description: data.tibetan_content,
          english_description: data.english_content,
          published_at: data.published_date,
          is_published: data.is_active !== undefined ? data.is_active : true,
          thumbnail_url: data.thumbnail_url,
        });
      } else {
        // Create new news
        await api.createNews({
          tibetan_title: data.tibetan_title,
          english_title: data.english_title,
          tibetan_description: data.tibetan_content,
          english_description: data.english_content,
          published_at: data.published_date,
          is_published: data.is_active !== undefined ? data.is_active : true,
          thumbnail_url: data.thumbnail_url,
        });
      }

      reload();

      setIsFormOpen(false);
      setEditingNews(null);
    } catch (error) {
      console.error('Error saving news:', error);
      alert(t('errorSavingNews'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('areYouSureDeleteNews'))) {
      return;
    }

    try {
      await api.deleteNews(id);
      
      reload();
    } catch (error) {
      console.error('Error deleting news:', error);
      alert(t('errorDeletingNews'));
    }
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingNews(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Search and Create Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 py-[10px]">{t('manageNewsContent')}</h1>
            <p className="text-gray-600 mt-1">{t('createEditManageNews')}</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} style={{fontFamily: isTibetan ? 'CustomTibetan' : ''}}>
            <Plus className="mr-2 h-4 w-4" />
            {t('createNews')}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('searchNewsArticles')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* News Cards Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('loadingNews')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsEntries.map(news => (
                <NewsCard key={news.id} news={news} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>

            <AdminPagination
              currentPage={page}
              totalItems={total}
              itemsPerPage={NEWS_PER_PAGE}
              onPageChange={setPage}
            />

            {newsEntries.length === 0 && isSearching && (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('noNewsArticlesFound')}</p>
              </div>
            )}

            {newsEntries.length === 0 && !isSearching && (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('noNewsArticlesAvailable')}</p>
              </div>
            )}
          </>
        )}

        {/* News Form */}
        <NewsForm
          isOpen={isFormOpen}
          onClose={handleClose}
          mode={editingNews ? 'edit' : 'create'}
          data={editingNews ? {
            id: Number.parseInt(editingNews.id),
            tibetan_title: editingNews.tibetanTitle,
            english_title: editingNews.englishTitle,
            tibetan_content: editingNews.tibetanDescription,
            english_content: editingNews.englishDescription,
            published_date: editingNews.createdAt,
            thumbnail_url: editingNews.thumbnailUrl || '',
            is_active: true
          } : undefined}
          onSave={handleSave}
        />
      </div>
    </AdminLayout>
  );
};

export default NewsAdmin;
