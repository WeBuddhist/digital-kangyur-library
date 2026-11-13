import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/atoms/card';
import { Button } from '@/components/ui/atoms/button';
import { Input } from '@/components/ui/atoms/input';
import { VideoForm } from '@/components/admin/videos/VideoForm';
import { Edit, Trash2, Search, Plus, ExternalLink } from 'lucide-react';
import api from '@/utils/api';
import { toast } from 'sonner';
import useLanguage from '@/hooks/useLanguage';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { useServerPagedList } from '@/hooks/useServerPagedList';

const VIDEOS_PER_PAGE = 12;

interface Video {
  id: string;
  tibetanTitle: string;
  englishTitle: string;
  tibetanDescription: string;
  englishDescription: string;
  videoLink: string;
  thumbnailUrl?: string;
  isActive: boolean;
  createdAt: string;
}

// Helper function to extract YouTube ID from URL
const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = pattern.exec(url);
    if (match?.[1]) {
      return match[1];
    }
  }
  
  return null;
};

const VideoCard = ({
  video,
  onEdit,
  onDelete
}: {
  video: Video;
  onEdit: (video: Video) => void;
  onDelete: (id: string) => void;
}) => {
  const { isTibetan, t } = useLanguage();
  const youtubeId = extractYouTubeId(video.videoLink);
  const hasThumbnail = video.thumbnailUrl && video.thumbnailUrl.trim() !== '';
  const renderThumbnail = () => {
    if (hasThumbnail) {
      return (
        <img 
          src={video.thumbnailUrl} 
          alt={video.englishTitle} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
        />
      );
    }
    
    if (youtubeId) {
      return (
        <div className="relative w-full h-full">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={video.englishTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
        <ExternalLink className="h-12 w-12 text-gray-400" />
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
      <div className="overflow-hidden h-48 bg-gray-100 relative">
        {renderThumbnail()}
      </div>
      <CardHeader className="pb-2">
        {isTibetan && video.tibetanTitle ? (
          <p className="text-sm font-medium text-kangyur-maroon tibetan mb-1">{video.tibetanTitle}</p>
        ) : (
          <CardTitle className="text-lg">{video.englishTitle}</CardTitle>
        )}
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <a 
          href={video.videoLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-kangyur-orange hover:underline flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          {t('viewVideo')}
        </a>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center gap-2 w-full">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(video)}>
            <Edit className="h-4 w-4 mr-2" />
            {t('edit')}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-red-600 hover:text-red-700"
            onClick={() => onDelete(video.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('delete')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const VideosAdmin = () => {
  const { t ,isTibetan} = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const {
    items: videos,
    total,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    isSearching,
    loading,
    reload: fetchVideos,
  } = useServerPagedList<Video>(
    async (page, limit, search) => {
      // 'all' = active and inactive videos
      const response = await api.getVideos({ page, limit, search, is_active: 'all' });
      const items: Video[] = response.videos.map((item: any) => ({
        id: item.id,
        tibetanTitle: item.title?.tibetan || '',
        englishTitle: item.title?.english || '',
        tibetanDescription: item.description?.tibetan || '',
        englishDescription: item.description?.english || '',
        videoLink: item.video_link || '',
        thumbnailUrl: item.thumbnail_url?.trim() ? item.thumbnail_url : undefined,
        isActive: item.is_active ?? true,
        createdAt: item.created_at,
      }));
      return { items, total: response.pagination?.total ?? 0 };
    },
    {
      pageSize: VIDEOS_PER_PAGE,
      onError: (error) => {
        console.error('Failed to fetch videos:', error);
        toast.error(t('failedToLoadVideos'));
      },
    }
  );

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setIsFormOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      const videoData = {
        tibetan_title: data.tibetan_title,
        english_title: data.english_title,
        tibetan_description: data.tibetan_description,
        english_description: data.english_description,
        video_link: data.video_link,
        thumbnail_url: data.thumbnail_url && data.thumbnail_url.trim() !== '' ? data.thumbnail_url : null,
        is_active: data.is_active,
      };

      if (editingVideo) {
        await api.updateVideo(editingVideo.id, videoData);
        toast.success(t('videoUpdatedSuccessfully'));
      } else {
        await api.createVideo(videoData);
        toast.success(t('videoCreatedSuccessfully'));
      }

      fetchVideos();
      setIsFormOpen(false);
      setEditingVideo(null);
    } catch (error: any) {
      console.error('Error saving video:', error);
      toast.error(error.message || t('errorSavingVideo'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('areYouSureDeleteVideo'))) {
      return;
    }

    try {
      await api.deleteVideo(id);
      toast.success(t('videoDeletedSuccessfully'));
      fetchVideos();
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast.error(error.message || t('errorDeletingVideo'));
    }
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingVideo(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6" style={{fontFamily: isTibetan ? 'CustomTibetan' : ''}}>
        {/* Header with Search and Create Button */}
        <div className="flex items-center flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 py-[10px]">{t('manageVideos')}</h1>
            <p className="text-gray-600 mt-1">{t('createEditManageVideos')}</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('createVideo')}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('searchVideos')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Videos Cards Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('loadingVideos')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map(video => (
                <VideoCard key={video.id} video={video} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>

            <AdminPagination
              currentPage={page}
              totalItems={total}
              itemsPerPage={VIDEOS_PER_PAGE}
              onPageChange={setPage}
            />

            {videos.length === 0 && isSearching && (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('noVideosFound')}</p>
              </div>
            )}

            {videos.length === 0 && !isSearching && (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('noVideosAvailable')}</p>
              </div>
            )}
          </>
        )}

        {/* Video Form */}
        <VideoForm
          isOpen={isFormOpen}
          onClose={handleClose}
          mode={editingVideo ? 'edit' : 'create'}
          data={editingVideo ? {
            id: editingVideo.id,
            tibetan_title: editingVideo.tibetanTitle,
            english_title: editingVideo.englishTitle,
            tibetan_description: editingVideo.tibetanDescription,
            english_description: editingVideo.englishDescription,
            video_link: editingVideo.videoLink,
            thumbnail_url: editingVideo.thumbnailUrl || '',
            is_active: editingVideo.isActive
          } : undefined}
          onSave={handleSave}
        />
      </div>
    </AdminLayout>
  );
};

export default VideosAdmin;
