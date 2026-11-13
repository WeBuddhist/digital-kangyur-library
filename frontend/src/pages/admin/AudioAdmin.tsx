import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/atoms/card';
import { Button } from '@/components/ui/atoms/button';
import { Input } from '@/components/ui/atoms/input';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import api from '@/utils/api';
import { toast } from 'sonner';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { useServerPagedList } from '@/hooks/useServerPagedList';

const RECORDINGS_PER_PAGE = 12;

const AudioAdmin = () => {
  const {
    items: recordings,
    total,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    loading,
    reload: fetchRecordings,
  } = useServerPagedList<any>(
    async (page, limit, search) => {
      // 'all' = active and inactive recordings
      const response = await api.getAudio({ page, limit, search, is_active: 'all' });
      return { items: response.recordings || [], total: response.pagination?.total ?? 0 };
    },
    {
      pageSize: RECORDINGS_PER_PAGE,
      onError: (error) => {
        console.error('Failed to fetch audio recordings:', error);
        toast.error('Failed to load audio recordings');
      },
    }
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) return;
    try {
      await api.deleteAudio(id);
      toast.success('Recording deleted successfully');
      fetchRecordings();
    } catch (error: any) {
      toast.error(error.message || 'Error deleting recording');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 py-[10px]">Manage Audio Recordings</h1>
            <p className="text-gray-600 mt-1">View and manage audio recordings</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Recording
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search recordings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading recordings...</p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordings.map(recording => (
              <Card key={recording.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{recording.title?.english || 'Untitled'}</CardTitle>
                  {recording.title?.tibetan && <p className="text-sm text-kangyur-maroon tibetan">{recording.title.tibetan}</p>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recording.duration_seconds && (
                      <p className="text-xs text-muted-foreground">
                        Duration: {Math.floor(recording.duration_seconds / 60)}:{(recording.duration_seconds % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-red-600" onClick={() => handleDelete(recording.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <AdminPagination
            currentPage={page}
            totalItems={total}
            itemsPerPage={RECORDINGS_PER_PAGE}
            onPageChange={setPage}
          />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AudioAdmin;
