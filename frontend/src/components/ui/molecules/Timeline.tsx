import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/atoms/card';
import { Badge } from '@/components/ui/atoms/badge';
import { Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import useLanguage from '@/hooks/useLanguage';
import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import { pickBilingualDisplay } from '@/utils/localizedContent';
import { RichTextContent } from '@/components/ui/molecules/RichTextContent';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/atoms/select';
import { Label } from '@/components/ui/atoms/label';

type TimelineEvent = {
  id: string;
  period: string;
  tibetanPeriod?: string;
  englishPeriod?: string;
  startYear: number;
  endYear: number;
  events: {
    id?: string;
    year: string;
    descriptionEnglish: string;
    descriptionTibetan: string;
    position?: number;
  }[];
};

// Period slug to translation key mapping
const periodSlugToKey: Record<string, string> = {
  'early-translation': 'earlyTranslationPeriod',
  'dark-age': 'darkAgeAndRevival',
  'proto-kangyur': 'protoKangyurFormation',
  'first-structured': 'firstStructuredKangyurs',
  'classic-manuscript': 'classicManuscriptKangyurs',
  'block-printed': 'blockPrintedEditions',
  'twentieth-century': 'twentiethCenturyEditions',
  'twenty-first-century': 'twentyFirstCenturyDigitalEditions',
};

const Timeline = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimelineEvent | null>(null);
  const [tickInterval, setTickInterval] = useState<number | null>(null);
  const { t, isTibetan } = useLanguage();

  // Built-in periods have translated titles; names edited in the admin (or new
  // periods) take precedence when present for the current language.
  const periodTitle = (period: TimelineEvent) => {
    const fromDb = isTibetan ? period.tibetanPeriod : period.englishPeriod;
    if (fromDb && fromDb.trim()) return fromDb;
    const key = periodSlugToKey[period.id];
    return key ? t(key) : period.englishPeriod || period.period;
  };

  // Fetch timeline data using React Query
  const { data: timelineData = [], isLoading } = useQuery({
    queryKey: ['timeline', 'periods', 'events'],
    queryFn: async () => {
      const periodsResponse = await api.getTimelinePeriods({ include_events: 'true' });
      const eventsResponse = await api.getTimelineEvents();

      // Transform API data to component format
      const transformedData: TimelineEvent[] = periodsResponse.periods.map((period: any) => {
        const periodEvents = eventsResponse.events.filter((event: any) => event.period_id === period.id);
        
        return {
          id: period.id_slug || period.id,
          period: periodSlugToKey[period.id_slug] || period.id_slug || period.id,
          tibetanPeriod: period.name?.tibetan,
          englishPeriod: period.name?.english,
          startYear: period.start_year,
          endYear: period.end_year,
          events: periodEvents.map((event: any) => {
            const descriptionEnglish =
              (event.description?.english || '').trim() || (event.title?.english || '').trim() || '';
            const descriptionTibetan =
              (event.description?.tibetan || '').trim() || (event.title?.tibetan || '').trim() || '';
            return {
              id: event.id,
              year: event.is_approximate
                ? `${event.year} CE (approx)`
                : `${event.year} CE`,
              descriptionEnglish,
              descriptionTibetan,
              position: event.year,
            };
          }),
        };
      });

      // Sort by start year
      transformedData.sort((a, b) => a.startYear - b.startYear);
      return transformedData;
    },
  });

  const { minYear, maxYear, yearRange, tickMarks, defaultInterval } = useMemo(() => {
    if (timelineData.length === 0) {
      return { minYear: 0, maxYear: 0, yearRange: 0, tickMarks: [], defaultInterval: 25 };
    }

    const allYears = timelineData.flatMap(period => [period.startYear, period.endYear]);
    const min = Math.min(...allYears);
    const max = Math.max(...allYears);
    const range = max - min;
    
    // Calculate default interval based on range if not set by user
    const calculatedDefaultInterval = range > 500 ? 50 : 25;
    const interval = tickInterval ?? calculatedDefaultInterval;
    
    const startTick = Math.floor(min / interval) * interval;
    const endTick = Math.ceil(max / interval) * interval;
    
    const ticks = [];
    for (let year = startTick; year <= endTick; year += interval) {
      ticks.push(year);
    }
    
    return {
      minYear: min,
      maxYear: max,
      yearRange: range,
      tickMarks: ticks,
      defaultInterval: calculatedDefaultInterval
    };
  }, [timelineData, tickInterval]);

  const getPositionPercent = (year: number) => {
    if (yearRange === 0) return 0;
    return ((year - minYear) / yearRange) * 100;
  };

  // Calculate minimum container width based on year range and ensure proper spacing
  const containerWidth = useMemo(() => {
    if (yearRange === 0) return 1000;
    // Base width calculation: ensure adequate spacing between periods
    // Use a scale factor that provides at least 2px per year for better readability
    const scaleFactor = Math.max(2, Math.ceil(yearRange / 500)); // Scale factor increases for larger ranges
    const baseWidth = Math.max(1200, yearRange * scaleFactor);
    // Add padding for period boxes and ensure minimum spacing
    // Each period needs at least 150px width, plus gaps between them
    const minPeriodWidth = 150;
    const totalPeriodSpace = timelineData.length * minPeriodWidth;
    const gapSpace = Math.max(50, timelineData.length * 10); // Minimum gaps between periods
    return Math.max(baseWidth, totalPeriodSpace + gapSpace + 200); // +200 for padding
  }, [yearRange, timelineData.length]);

  return (
    <div className={cn("w-full")}>
      {/* Mobile: vertical list of periods (the scaled canvas below is too wide for phones) */}
      <div className="md:hidden">
        {isLoading && (
          <div className="flex items-center justify-center h-40 bg-white border border-kangyur-orange/20 rounded-lg">
            <p className="text-kangyur-dark/60">Loading timeline...</p>
          </div>
        )}
        {!isLoading && timelineData.length === 0 && (
          <div className="flex items-center justify-center h-40 bg-white border border-kangyur-orange/20 rounded-lg">
            <p className="text-kangyur-dark/60">No timeline data available</p>
          </div>
        )}
        {!isLoading && timelineData.length > 0 && (
          <ol className="relative border-l-2 border-kangyur-orange/30 ml-2 space-y-4">
            {timelineData.map((period) => (
              <li key={period.id} className="pl-5 relative">
                <span className="absolute -left-[9px] top-4 h-4 w-4 rounded-full bg-kangyur-orange border-2 border-white" />
                <button
                  type="button"
                  onClick={() => setSelectedPeriod(period)}
                  className="w-full text-left bg-gradient-to-br from-kangyur-cream to-white border border-kangyur-orange/30 rounded-lg p-4 active:scale-[0.99] transition-transform"
                >
                  <Badge variant="outline" className="text-xs mb-2 bg-kangyur-orange/10">
                    {period.startYear} - {period.endYear}
                  </Badge>
                  <h4 className={cn('font-semibold text-base text-kangyur-maroon leading-snug', isTibetan && 'tibetan')}>
                    {periodTitle(period)}
                  </h4>
                  <p className="text-xs text-kangyur-dark/50 mt-1">{period.events.length} events</p>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Timeline Container */}
      <div className="hidden md:block bg-white border border-kangyur-orange/20 rounded-lg p-6 overflow-x-auto min-h-[480px] w-full">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center h-64 w-full">
            <p className="text-kangyur-dark/60">Loading timeline...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && timelineData.length === 0 && (
          <div className="flex items-center justify-center h-64 w-full">
            <p className="text-kangyur-dark/60">No timeline data available</p>
          </div>
        )}

        {/* Timeline content */}
        {!isLoading && timelineData.length > 0 && (
          <div className="relative" style={{ width: `${containerWidth}px`, minWidth: `${containerWidth}px` }}>
            {/* Year markers at top */}
            <div className="relative mb-8 h-8" style={{ width: '100%' }}>
              {tickMarks.map((year) => (
                <div
                  key={year}
                  className="absolute top-0 text-xs text-kangyur-dark/60 font-medium"
                  style={{ left: `${getPositionPercent(year)}%` }}
                >
                  <div className="relative -translate-x-1/2">
                    {year}
                  </div>
                </div>
              ))}
            </div>

            {/* Main timeline line */}
            <div className="relative h-2 mb-8" style={{ width: '100%' }}>
              <div 
                className="absolute h-full bg-kangyur-orange/20 rounded-full"
                style={{ 
                  left: `${getPositionPercent(minYear)}%`,
                  width: `${getPositionPercent(maxYear) - getPositionPercent(minYear)}%`
                }}
              >
                {/* Tick marks */}
                {tickMarks.map((year) => {
                  const tickPosition = getPositionPercent(year);
                  const minPos = getPositionPercent(minYear);
                  const maxPos = getPositionPercent(maxYear);
                  // Only show tick marks that fall within the actual data range
                  if (tickPosition >= minPos && tickPosition <= maxPos) {
                    const relativePosition = maxPos > minPos 
                      ? ((tickPosition - minPos) / (maxPos - minPos)) * 100 
                      : 0;
                    return (
                      <div
                        key={year}
                        className="absolute top-0 h-full w-0.5 bg-kangyur-orange/40"
                        style={{ left: `${relativePosition}%` }}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Period boxes positioned along timeline */}
            <div className="relative" style={{ width: '100%', minHeight: '240px' }}>
              {timelineData.map((period, index) => {
                const leftPosition = getPositionPercent(period.startYear);
                const rightPosition = getPositionPercent(period.endYear);
                // Use exact calculated width to ensure proper alignment with timeline bar
                const calculatedWidth = rightPosition - leftPosition;
                
                // Calculate row based on overlap detection to prevent stacking too many on same row
                // Simple approach: distribute across rows with consistent spacing
                const rowsPerPeriod = 3;
                const row = index % rowsPerPeriod;
                const topOffset = row * 80 + 10; // Increased spacing between rows

                return (
                  <button
                    key={period.id}
                    type="button"
                    className="absolute cursor-pointer group border-0 bg-transparent p-0 text-left"
                    style={{
                      left: `${leftPosition}%`,
                      top: `${topOffset}px`,
                      width: `${calculatedWidth}%`,
                      minWidth: '120px' // Ensure minimum width for readability
                    }}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-kangyur-orange/30 bg-gradient-to-br from-kangyur-cream to-white">
                      <CardContent className="p-2.5">
                        <div className="text-center">
                          <Badge variant="outline" className="text-xs mb-1.5 bg-kangyur-orange/10">
                            {period.startYear} - {period.endYear}
                          </Badge>
                          <h4 className={cn(
                            "font-semibold text-xs leading-tight mb-1",
                            isTibetan ? 'tibetan text-kangyur-maroon' : 'text-kangyur-maroon'
                          )}>
                            {periodTitle(period)}
                          </h4>
                          <div className="text-xs text-kangyur-dark/50 mt-1">
                            {period.events.length} events
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dialog for selected period */}
      {selectedPeriod && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelectedPeriod(null)}>
          <Card className="max-w-3xl w-full max-h-[90dvh] sm:max-h-[80vh] overflow-y-auto rounded-b-none sm:rounded-b-lg" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                    <Badge variant="secondary" className="bg-kangyur-cream text-kangyur-maroon">
                      {selectedPeriod.startYear} - {selectedPeriod.endYear}
                    </Badge>
                    <span className="text-sm text-kangyur-dark/60">
                      ({selectedPeriod.endYear - selectedPeriod.startYear} years)
                    </span>
                  </div>
                  <h3 className={cn("text-xl sm:text-2xl font-bold text-kangyur-maroon mb-2", isTibetan ? 'tibetan' : 'english')}>
                    {periodTitle(selectedPeriod)}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedPeriod(null)}
                  className="text-kangyur-dark/60 hover:text-kangyur-dark p-1 rounded-md hover:bg-kangyur-cream/50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="font-semibold text-kangyur-maroon mb-3">Key Developments</h4>
                <div className="space-y-4">
                  {selectedPeriod.events.map((event, index) => {
                    const evDisp = pickBilingualDisplay(
                      isTibetan,
                      event.descriptionTibetan,
                      event.descriptionEnglish
                    );
                    return (
                    <div key={event.id || `event-${event.year}-${index}`} className="border-l-4 border-kangyur-orange/30 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-kangyur-orange" />
                        <Badge variant="outline" className="text-xs">
                          {event.year}
                        </Badge>
                      </div>
                      <RichTextContent
                        value={evDisp.text}
                        tibetan={evDisp.scriptIsTibetan}
                        className="text-kangyur-dark leading-relaxed"
                      />
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-4 border-t border-kangyur-orange/20">
                <button 
                  onClick={() => setSelectedPeriod(null)}
                  className="px-4 py-2 bg-kangyur-orange text-white rounded-md hover:bg-kangyur-orange/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Timeline;
