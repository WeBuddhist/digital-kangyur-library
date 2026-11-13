import React, { useMemo, useState, useEffect } from 'react';
import { StickyFooterShell } from '@/components/ui/molecules/Footer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/atoms/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/atoms/pagination";
import { Clock, Play, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/atoms/dialog';
import useLanguage from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import api from '@/utils/api';
import { pickBilingualDisplay, pickBilingualText } from '@/utils/localizedContent';

interface VideoItem {
  id: string;
  title: string;
  titleTibetan?: string;
  duration: string;
  thumbnailUrl: string;
  link?: string;
  youtubeId?: string;
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

// Helper function to get thumbnail URL with fallback priority
const getThumbnailUrl = (thumbnailUrl: string | null | undefined, youtubeId: string | undefined): string => {
  // Priority 1: Use thumbnail if available
  if (thumbnailUrl && thumbnailUrl.trim() !== '') {
    return thumbnailUrl;
  }
  
  // Priority 2: Use YouTube thumbnail if it's a YouTube video
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  }
  
  // Priority 3: Use default placeholder
  return '/placeholder.svg';
};

const VideoCard = ({ video, onPlay, t, isTibetan }: { video: VideoItem; onPlay: (video: VideoItem) => void; t: any; isTibetan: boolean }) => {
  const titleDisp = pickBilingualDisplay(isTibetan, video.titleTibetan, video.title);
  const displayTitle = titleDisp.text;

  const thumbnailSrc = getThumbnailUrl(video.thumbnailUrl, video.youtubeId);

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative overflow-hidden h-48">
        <img 
          src={thumbnailSrc}
          alt={displayTitle}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            // Fallback if YouTube thumbnail fails, try hqdefault, then default
            const target = e.target as HTMLImageElement;
            if (video.youtubeId && target.src.includes('youtube.com')) {
              if (target.src.includes('maxresdefault')) {
                target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
              } else if (target.src.includes('hqdefault')) {
                target.src = `https://img.youtube.com/vi/${video.youtubeId}/default.jpg`;
              } else {
                target.src = '/placeholder.svg';
              }
            } else {
              target.src = '/placeholder.svg';
            }
          }}
        />
        {(video.youtubeId || video.link) && (
          <button
            onClick={() => onPlay(video)}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
            aria-label="Play video"
          >
            <span className="h-12 w-12 rounded-full bg-white/90 text-kangyur-maroon flex items-center justify-center shadow">
              <Play className="h-6 w-6" />
            </span>
          </button>
        )}
      </div>
      <CardHeader className="pb-2">
        {titleDisp.scriptIsTibetan ? (
          <p className="text-sm font-medium text-kangyur-maroon tibetan mb-1">{displayTitle}</p>
        ) : (
          <CardTitle className="text-lg">{displayTitle}</CardTitle>
        )}
      </CardHeader>
     
    </Card>
  );
};

const Videos = () => {
  const { isTibetan, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [videoItems, setVideoItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await api.getVideos({
          page: currentPage,
          limit: itemsPerPage,
          is_active: 'true',
        });

        const transformedVideos: VideoItem[] = response.videos.map((item: any) => {
          const videoLink = item.video_link || '';
          const youtubeId = extractYouTubeId(videoLink);
          
          return {
            id: item.id,
            title: item.title?.english || '',
            titleTibetan: item.title?.tibetan,
            thumbnailUrl: item.thumbnail_url || '',
            link: videoLink,
            youtubeId: youtubeId || undefined,
          };
        });

        setVideoItems(transformedVideos);
        setTotalPages(response.pagination?.total_pages || 1);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setVideoItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [currentPage]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return videoItems;
    return videoItems.filter(v => {
      const en = v.title.toLowerCase();
      const tib = (v.titleTibetan || '').toLowerCase();
      return en.includes(q) || tib.includes(q);
    });
  }, [query, videoItems]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handlePlay = (video: VideoItem) => {
    setActiveVideo(video);
  };

  const renderVideoDialogContent = () => {
    if (!activeVideo) return null;
    
    if (activeVideo.youtubeId) {
      const dialogTitle = pickBilingualText(isTibetan, activeVideo.titleTibetan, activeVideo.title);
      return (
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
            title={dialogTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      );
    }
    
    if (activeVideo.link) {
      return (
        <div className="p-6 text-center">
          <p className="mb-4 text-kangyur-dark">{pickBilingualText(isTibetan, activeVideo.titleTibetan, activeVideo.title)}</p>
          <a
            href={activeVideo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-kangyur-maroon text-white rounded-md hover:bg-kangyur-maroon/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Video
          </a>
        </div>
      );
    }
    
    return null;
  };

  return (
    <StickyFooterShell className={cn('bg-kangyur-light', isTibetan ? 'tibetan' : 'english')}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4">
        <div className="mb-6 text-center pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-kangyur-dark mb-3">
            {t("kangyurVideos")}
          </h1>
          <p className="text-xl text-kangyur-dark/70 max-w-2xl mx-auto">
            {t("videosSubtitle")}
          </p>
        </div>

        <div className="mb-8 max-w-xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
            placeholder={t("searchVideos")}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-kangyur-orange/50"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-kangyur-dark/60">Loading videos...</p>
          </div>
        )}
        
        {!loading && filtered.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <p className="text-kangyur-dark/60">
              {query ? 'No videos found matching your search.' : 'No videos available.'}
            </p>
          </div>
        )}
        
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filtered.map((video) => (
              <VideoCard key={video.id} video={video} onPlay={handlePlay} t={t} isTibetan={isTibetan} />
            ))}
          </div>
        )}

        {totalPages>1 &&!loading && filtered.length > 0 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={cn(
                    currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer",
                    isTibetan ? 'tibetan' : 'english'
                  )}
                >
                  {t("previous")}
                </PaginationPrevious>
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <PaginationItem key={`page-${pageNum}`}>
                  <PaginationLink
                    isActive={currentPage === pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={cn(
                    currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer",
                    isTibetan ? 'tibetan' : 'english'
                  )}
                >
                  {t("next")}
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-scroll">
          {renderVideoDialogContent()}
        </DialogContent>
      </Dialog>
    </StickyFooterShell>
  );
};

export default Videos; 