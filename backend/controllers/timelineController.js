const { timelinePeriodService, timelineEventService, prisma } = require('../prisma/database');
const { AppError } = require('../utils/errors');

const getTimelinePeriods = async (req, res, next) => {
  try {
    const { lang = 'en', include_events = 'false' } = req.query;

    const periods = await timelinePeriodService.findAll();

    const formattedPeriods = periods.map(period => {
      const result = {
        id: period.id,
        id_slug: period.id_slug,
        name: {
          tibetan: period.name_tibetan,
          english: period.name_english,
        },
        description: period.description,
        start_year: period.start_year,
        end_year: period.end_year,
      };

      if (include_events === 'true' && period.events) {
        result.events = period.events.map(event => ({
          id: event.id,
          title: {
            tibetan: event.title_tibetan,
            english: event.title_english,
            sanskrit: event.title_sanskrit,
          },
          year: event.year,
          category: event.category,
        }));
      }

      return result;
    });

    res.json({
      periods: formattedPeriods,
    });
  } catch (error) {
    next(error);
  }
};

const getTimelineEvents = async (req, res, next) => {
  try {
    const {
      period_id,
      category,
      significance,
      year_from,
      year_to,
      lang = 'en',
      include_figures = 'false',
      include_sources = 'false',
      include_relations = 'false',
      sort = 'year',
      order = 'asc',
    } = req.query;

    const events = await timelineEventService.findAll({ period_id });

    // Apply filters
    let filteredEvents = events;
    if (category) {
      filteredEvents = filteredEvents.filter(e => e.category === category);
    }
    if (significance) {
      filteredEvents = filteredEvents.filter(e => e.significance === significance);
    }
    if (year_from) {
      filteredEvents = filteredEvents.filter(e => e.year >= parseInt(year_from, 10));
    }
    if (year_to) {
      filteredEvents = filteredEvents.filter(e => e.year <= parseInt(year_to, 10));
    }

    // Sort
    filteredEvents.sort((a, b) => {
      let aVal = a[sort] || 0;
      let bVal = b[sort] || 0;

      if (typeof aVal === 'string') {
        return order === 'desc'
          ? bVal.localeCompare(aVal)
          : aVal.localeCompare(bVal);
      }

      return order === 'desc' ? bVal - aVal : aVal - bVal;
    });

    const formattedEvents = await Promise.all(filteredEvents.map(async (event) => {
      const result = {
        id: event.id,
        period_id: event.period_id,
        title: {
          tibetan: event.title_tibetan,
          english: event.title_english,
          sanskrit: event.title_sanskrit,
        },
        description: {
          tibetan: event.description_tibetan,
          english: event.description_english,
        },
        category: event.category,
        year: event.year,
        century: event.century,
        era: event.era,
        is_approximate: event.is_approximate,
        location: {
          tibetan: event.location_tibetan,
          english: event.location_english,
        },
        significance: event.significance,
        order_index: event.order_index,
        figures: [],
        sources: [],
        related_events: [],
      };

      if (include_figures === 'true') {
        const eventWithRelations = await timelineEventService.findById(event.id);
        if (eventWithRelations && eventWithRelations.figures) {
          result.figures = eventWithRelations.figures.map(f => ({
            id: f.id,
            name: {
              tibetan: f.name_tibetan,
              english: f.name_english,
            },
            role: f.role,
          }));
        }
      }

      if (include_sources === 'true') {
        const eventWithRelations = await timelineEventService.findById(event.id);
        if (eventWithRelations && eventWithRelations.sources) {
          result.sources = eventWithRelations.sources.map(s => ({
            id: s.id,
            source_title: s.source_title,
            source_url: s.source_url,
            citation: s.citation,
          }));
        }
      }

      if (include_relations === 'true') {
        const eventWithRelations = await timelineEventService.findById(event.id);
        if (eventWithRelations && eventWithRelations.relations) {
          result.related_events = eventWithRelations.relations.map(r => ({
            event_id: r.related_event_id,
            relation_type: r.relation_type,
          }));
        }
      }

      return result;
    }));

    res.json({
      events: formattedEvents,
    });
  } catch (error) {
    next(error);
  }
};

const getTimelineEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      lang = 'en',
      include_figures = 'true',
      include_sources = 'true',
      include_relations = 'true',
    } = req.query;

    const event = await timelineEventService.findById(id);
    if (!event) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
    }

    const result = {
      id: event.id,
      period_id: event.period_id,
      title: {
        tibetan: event.title_tibetan,
        english: event.title_english,
        sanskrit: event.title_sanskrit,
      },
      description: {
        tibetan: event.description_tibetan,
        english: event.description_english,
      },
      category: event.category,
      year: event.year,
      century: event.century,
      era: event.era,
      is_approximate: event.is_approximate,
      location: {
        tibetan: event.location_tibetan,
        english: event.location_english,
      },
      significance: event.significance,
      order_index: event.order_index,
      figures: include_figures === 'true' && event.figures ? event.figures.map(f => ({
        id: f.id,
        name: {
          tibetan: f.name_tibetan,
          english: f.name_english,
        },
        role: f.role,
      })) : [],
      sources: include_sources === 'true' && event.sources ? event.sources.map(s => ({
        id: s.id,
        source_title: s.source_title,
        source_url: s.source_url,
        citation: s.citation,
      })) : [],
      related_events: include_relations === 'true' && event.relations ? event.relations.map(r => ({
        event_id: r.related_event_id,
        relation_type: r.relation_type,
      })) : [],
    };

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const createTimelineEvent = async (req, res, next) => {
  try {
    const {
      period_id,
      title_tibetan,
      title_english,
      title_sanskrit,
      description_tibetan,
      description_english,
      category,
      year,
      century,
      era,
      is_approximate = false,
      location_tibetan,
      location_english,
      significance,
      order_index = 0,
      figures = [],
      sources = [],
    } = req.body;

    // period_id is a required relation in the schema, so an event cannot be
    // created without one.
    if (!period_id || !title_english || !description_english || !category || !year || !significance) {
      throw new AppError('VALIDATION_ERROR', 'Required fields missing', 400);
    }

    const period = await timelinePeriodService.findById(period_id);
    if (!period) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Period not found', 404);
    }

    const event = await timelineEventService.create({
      period_id,
      title_tibetan,
      title_english,
      title_sanskrit,
      description_tibetan,
      description_english,
      category,
      year,
      century,
      era: era || 'CE',
      is_approximate,
      location_tibetan,
      location_english,
      significance,
      order_index,
    });

    // Create figures
    for (const figure of figures) {
      await prisma.timelineEventFigure.create({
        data: {
          event_id: event.id,
          name_tibetan: figure.name_tibetan,
          name_english: figure.name_english,
          role: figure.role,
        }
      });
    }

    // Create sources
    for (const source of sources) {
      await prisma.timelineEventSource.create({
        data: {
          event_id: event.id,
          source_title: source.source_title,
          source_url: source.source_url,
          citation: source.citation,
        }
      });
    }

    res.status(201).json({
      id: event.id,
      created_at: event.created_at,
    });
  } catch (error) {
    next(error);
  }
};

const updateTimelineEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await timelineEventService.findById(id);

    if (!event) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
    }

    const updateData = {};
    const fields = [
      'period_id', 'title_tibetan', 'title_english', 'title_sanskrit',
      'description_tibetan', 'description_english', 'category', 'year',
      'century', 'era', 'is_approximate', 'location_tibetan', 'location_english',
      'significance', 'order_index',
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.period_id !== undefined) {
      if (!updateData.period_id || !(await timelinePeriodService.findById(updateData.period_id))) {
        throw new AppError('VALIDATION_ERROR', 'A valid period is required', 400);
      }
    }

    const updated = await timelineEventService.update(id, updateData);

    res.json({
      id: updated.id,
      updated_at: updated.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTimelineEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await timelineEventService.findById(id);

    if (!event) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
    }

    // Prisma will handle cascade deletes
    await timelineEventService.delete(id);

    res.json({
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const PERIOD_FIELDS = ['id_slug', 'name_english', 'name_tibetan', 'description', 'start_year', 'end_year'];

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const pickPeriodData = (body) => {
  const data = {};
  PERIOD_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  ['start_year', 'end_year'].forEach((field) => {
    if (data[field] !== undefined) data[field] = Number.parseInt(data[field], 10);
  });
  ['name_tibetan', 'description'].forEach((field) => {
    if (data[field] === '') data[field] = null;
  });
  if (data.id_slug !== undefined) data.id_slug = slugify(data.id_slug);
  return data;
};

const validatePeriodYears = (start, end) => {
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    throw new AppError('VALIDATION_ERROR', 'Start and end years must be whole numbers', 400);
  }
  if (start > end) {
    throw new AppError('VALIDATION_ERROR', 'Start year must not be after end year', 400);
  }
};

const formatPeriod = (period) => ({
  id: period.id,
  id_slug: period.id_slug,
  name: { tibetan: period.name_tibetan, english: period.name_english },
  description: period.description,
  start_year: period.start_year,
  end_year: period.end_year,
});

const createTimelinePeriod = async (req, res, next) => {
  try {
    const data = pickPeriodData(req.body);
    if (!data.name_english) {
      throw new AppError('VALIDATION_ERROR', 'English name is required', 400);
    }
    if (!data.id_slug) data.id_slug = slugify(data.name_english);
    if (!data.id_slug) {
      throw new AppError('VALIDATION_ERROR', 'A slug is required', 400);
    }
    validatePeriodYears(data.start_year, data.end_year);

    if (await timelinePeriodService.findBySlug(data.id_slug)) {
      throw new AppError('VALIDATION_ERROR', 'A period with this slug already exists', 409);
    }

    const period = await timelinePeriodService.create(data);
    res.status(201).json(formatPeriod(period));
  } catch (error) {
    next(error);
  }
};

const updateTimelinePeriod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await timelinePeriodService.findById(id);
    if (!existing) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Period not found', 404);
    }

    const data = pickPeriodData(req.body);
    if (data.name_english !== undefined && !data.name_english) {
      throw new AppError('VALIDATION_ERROR', 'English name is required', 400);
    }
    if (data.id_slug !== undefined && !data.id_slug) {
      throw new AppError('VALIDATION_ERROR', 'A slug is required', 400);
    }
    validatePeriodYears(data.start_year ?? existing.start_year, data.end_year ?? existing.end_year);

    if (data.id_slug && data.id_slug !== existing.id_slug) {
      if (await timelinePeriodService.findBySlug(data.id_slug)) {
        throw new AppError('VALIDATION_ERROR', 'A period with this slug already exists', 409);
      }
    }

    const period = await timelinePeriodService.update(id, data);
    res.json(formatPeriod(period));
  } catch (error) {
    next(error);
  }
};

const deleteTimelinePeriod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await timelinePeriodService.findById(id);
    if (!existing) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Period not found', 404);
    }

    // Events cascade-delete with their period (onDelete: Cascade in the schema).
    await timelinePeriodService.delete(id);
    res.json({ message: 'Period deleted successfully', deleted_events: existing.events?.length || 0 });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTimelinePeriod,
  updateTimelinePeriod,
  deleteTimelinePeriod,
  getTimelinePeriods,
  getTimelineEvents,
  getTimelineEventById,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
};
