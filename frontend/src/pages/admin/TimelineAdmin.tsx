import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/atoms/card';
import { Button } from '@/components/ui/atoms/button';
import { Input } from '@/components/ui/atoms/input';
import { Badge } from '@/components/ui/atoms/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/atoms/select';
import { Edit, Trash2, Search, Plus, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/utils/api';
import { toast } from 'sonner';
import { TimelineEventForm } from '@/components/admin/timeline/TimelineEventForm';
import { TimelinePeriodForm, TimelinePeriodFormData } from '@/components/admin/timeline/TimelinePeriodForm';
import { richTextToPlain } from '@/utils/richText';

const ALL = 'all';

const TimelineAdmin = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>(ALL);
  const [periods, setPeriods] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Event dialog
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [eventFormMode, setEventFormMode] = useState<'create' | 'edit'>('create');
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [defaultPeriodId, setDefaultPeriodId] = useState<string | undefined>();

  // Period dialog
  const [isPeriodFormOpen, setIsPeriodFormOpen] = useState(false);
  const [periodFormMode, setPeriodFormMode] = useState<'create' | 'edit'>('create');
  const [editingPeriod, setEditingPeriod] = useState<any>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [periodsResponse, eventsResponse] = await Promise.all([
        api.getTimelinePeriods({}),
        api.getTimelineEvents({}),
      ]);
      setPeriods(periodsResponse.periods || []);
      setEvents(eventsResponse.events || []);
    } catch (error) {
      console.error('Failed to fetch history timeline:', error);
      toast.error('Failed to load history timeline');
      setPeriods([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const query = searchQuery.trim().toLowerCase();
  const matchesSearch = (event: any) => {
    if (!query) return true;
    const haystack = [
      event.title?.english,
      event.title?.tibetan,
      richTextToPlain(event.description?.english),
      richTextToPlain(event.description?.tibetan),
      String(event.year ?? ''),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  };

  const eventsByPeriod = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    for (const event of events) {
      if (!matchesSearch(event)) continue;
      (grouped[event.period_id] ||= []).push(event);
    }
    Object.values(grouped).forEach((list) =>
      list.sort((a, b) => a.year - b.year || (a.order_index ?? 0) - (b.order_index ?? 0))
    );
    return grouped;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, query]);

  const visiblePeriods = periods.filter((period) => {
    if (periodFilter !== ALL && period.id !== periodFilter) return false;
    // While searching, hide periods with no matching events.
    if (query && !(eventsByPeriod[period.id]?.length)) return false;
    return true;
  });

  const totalMatching = visiblePeriods.reduce((sum, p) => sum + (eventsByPeriod[p.id]?.length || 0), 0);

  // ----- Periods -----
  const handleCreatePeriod = () => {
    setPeriodFormMode('create');
    setEditingPeriod(null);
    setIsPeriodFormOpen(true);
  };

  const handleEditPeriod = (period: any) => {
    setPeriodFormMode('edit');
    setEditingPeriod(period);
    setIsPeriodFormOpen(true);
  };

  const handleSavePeriod = async (data: TimelinePeriodFormData) => {
    try {
      if (periodFormMode === 'create') {
        await api.createTimelinePeriod(data);
        toast.success('Period created successfully');
      } else {
        await api.updateTimelinePeriod(editingPeriod.id, data);
        toast.success('Period updated successfully');
      }
      setIsPeriodFormOpen(false);
      setEditingPeriod(null);
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${periodFormMode === 'create' ? 'create' : 'update'} period`);
      throw error;
    }
  };

  const handleDeletePeriod = async (period: any) => {
    const count = events.filter((e) => e.period_id === period.id).length;
    const message = count
      ? `Delete "${period.name?.english}" and its ${count} event${count === 1 ? '' : 's'}? This cannot be undone.`
      : `Delete "${period.name?.english}"?`;
    if (!confirm(message)) return;
    try {
      await api.deleteTimelinePeriod(period.id);
      toast.success('Period deleted successfully');
      if (periodFilter === period.id) setPeriodFilter(ALL);
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || 'Error deleting period');
    }
  };

  // ----- Events -----
  const handleCreateEvent = (periodId?: string) => {
    setEventFormMode('create');
    setEditingEvent(null);
    setDefaultPeriodId(periodId);
    setIsEventFormOpen(true);
  };

  const handleEditEvent = async (event: any) => {
    try {
      const fullEvent = await api.getTimelineEventById(event.id, {});
      setEditingEvent(fullEvent);
      setEventFormMode('edit');
      setDefaultPeriodId(undefined);
      setIsEventFormOpen(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load event details');
    }
  };

  const handleSaveEvent = async (data: any) => {
    try {
      if (eventFormMode === 'create') {
        await api.createTimelineEvent(data);
        toast.success('Event created successfully');
      } else {
        if (!editingEvent?.id) {
          toast.error('Event ID is missing');
          return;
        }
        await api.updateTimelineEvent(editingEvent.id, data);
        toast.success('Event updated successfully');
      }
      setIsEventFormOpen(false);
      setEditingEvent(null);
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${eventFormMode === 'create' ? 'create' : 'update'} event`);
      throw error; // Keep the dialog open
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.deleteTimelineEvent(id);
      toast.success('Event deleted successfully');
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || 'Error deleting event');
    }
  };

  const togglePeriod = (id: string) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 py-[10px]">Manage History</h1>
            <p className="text-gray-600 mt-1">
              Edit the periods and events shown on the{' '}
              <Link to="/history" target="_blank" className="text-kangyur-orange hover:underline inline-flex items-center gap-1">
                History page <ExternalLink className="h-3 w-3" />
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleCreatePeriod}>
              <Plus className="mr-2 h-4 w-4" />
              New Period
            </Button>
            <Button onClick={() => handleCreateEvent(periodFilter !== ALL ? periodFilter : undefined)} disabled={!periods.length}>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events by title, description or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="sm:w-72">
              <SelectValue placeholder="All periods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All periods</SelectItem>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.name?.english || period.id_slug}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading history timeline...</p>
          </div>
        ) : periods.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg bg-white">
            <p className="text-gray-600 mb-4">No periods yet. Create a period first, then add events to it.</p>
            <Button onClick={handleCreatePeriod}>
              <Plus className="mr-2 h-4 w-4" /> New Period
            </Button>
          </div>
        ) : visiblePeriods.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No events match your search.</p>
        ) : (
          <div className="space-y-4">
            {query && <p className="text-sm text-gray-500">{totalMatching} matching event{totalMatching === 1 ? '' : 's'}</p>}
            {visiblePeriods.map((period) => {
              const periodEvents = eventsByPeriod[period.id] || [];
              const isCollapsed = collapsed[period.id] && !query;
              return (
                <Card key={period.id} className="bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <button
                        type="button"
                        className="flex items-start gap-2 text-left flex-1"
                        onClick={() => togglePeriod(period.id)}
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-5 w-5 mt-0.5 text-gray-500 shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 mt-0.5 text-gray-500 shrink-0" />
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg font-semibold text-gray-800">{period.name?.english || period.id_slug}</span>
                            <Badge variant="outline">{period.start_year} – {period.end_year}</Badge>
                            <Badge variant="secondary">{periodEvents.length} event{periodEvents.length === 1 ? '' : 's'}</Badge>
                          </div>
                          {period.name?.tibetan && <p className="text-sm text-kangyur-maroon tibetan mt-1">{period.name.tibetan}</p>}
                          <p className="text-xs text-muted-foreground mt-1">slug: {period.id_slug}</p>
                        </div>
                      </button>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleCreateEvent(period.id)}>
                          <Plus className="h-4 w-4 mr-1" /> Event
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditPeriod(period)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeletePeriod(period)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {!isCollapsed && (
                    <CardContent className="pt-0">
                      {periodEvents.length === 0 ? (
                        <p className="text-sm text-gray-500 pl-7">No events in this period.</p>
                      ) : (
                        <ul className="divide-y border rounded-md">
                          {periodEvents.map((event) => {
                            const description = richTextToPlain(event.description?.english);
                            return (
                              <li key={event.id} className="flex flex-col sm:flex-row sm:items-start gap-3 p-3">
                                <div className="sm:w-28 shrink-0">
                                  <Badge variant="outline" className="font-mono">
                                    {event.is_approximate ? 'c. ' : ''}
                                    {event.year}
                                  </Badge>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800">{event.title?.english || 'Untitled'}</p>
                                  {event.title?.tibetan && <p className="text-sm text-kangyur-maroon tibetan">{event.title.tibetan}</p>}
                                  {description && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{description}</p>}
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {event.category && <Badge variant="secondary" className="text-xs">{event.category}</Badge>}
                                    {event.significance && <Badge variant="outline" className="text-xs">{event.significance}</Badge>}
                                    {!event.description?.tibetan && (
                                      <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">no Tibetan text</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteEvent(event.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <TimelineEventForm
          isOpen={isEventFormOpen}
          onClose={() => {
            setIsEventFormOpen(false);
            setEditingEvent(null);
          }}
          mode={eventFormMode}
          data={editingEvent}
          defaultPeriodId={defaultPeriodId}
          onSave={handleSaveEvent}
        />

        <TimelinePeriodForm
          isOpen={isPeriodFormOpen}
          onClose={() => {
            setIsPeriodFormOpen(false);
            setEditingPeriod(null);
          }}
          mode={periodFormMode}
          data={editingPeriod}
          onSave={handleSavePeriod}
        />
      </div>
    </AdminLayout>
  );
};

export default TimelineAdmin;
