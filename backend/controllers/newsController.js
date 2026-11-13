const { newsService } = require('../prisma/database');
const { AppError } = require('../utils/errors');
const { paginate, parsePaginationParams } = require('../utils/pagination');
const { normalizeDateTime } = require('../utils/dateTime');

const getNews = async (req, res, next) => {
  try {
    const { page, limit } = parsePaginationParams(req);
    const {
      lang = 'en',
      sort = 'published_at',
      order = 'desc',
      search,
    } = req.query;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 50);
    
    const orderBy = {};
    if (sort === 'published_at') {
      orderBy.published_at = order;
    } else if (sort === 'created_at') {
      orderBy.created_at = order;
    }

    const news = await newsService.findAll({
      is_published: true,
      search,
      skip,
      take,
      orderBy
    });

    const total = await newsService.count({ is_published: true, search });
    const pagination = {
      page,
      limit: take,
      total,
      total_pages: Math.ceil(total / take),
      has_next: page * take < total,
      has_prev: page > 1
    };

    const formattedNews = news.map(item => ({
      id: item.id,
      title: {
        tibetan: item.tibetan_title,
        english: item.english_title,
      },
      description: {
        tibetan: item.tibetan_description,
        english: item.english_description,
      },
      thumbnail_url: item.thumbnail_url,
      published_at: item.published_at,
      created_at: item.created_at,
    }));

    res.json({
      news: formattedNews,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getNewsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const newsItem = await newsService.findById(id);
    if (!newsItem || !newsItem.is_published) {
      throw new AppError('RESOURCE_NOT_FOUND', 'News not found or not published', 404);
    }

    res.json({
      id: newsItem.id,
      title: {
        tibetan: newsItem.tibetan_title,
        english: newsItem.english_title,
      },
      description: {
        tibetan: newsItem.tibetan_description,
        english: newsItem.english_description,
      },
      thumbnail_url: newsItem.thumbnail_url,
      published_at: newsItem.published_at,
      created_at: newsItem.created_at,
      updated_at: newsItem.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

const createNews = async (req, res, next) => {
  try {
    const {
      tibetan_title,
      english_title,
      tibetan_description,
      english_description,
      thumbnail_url,
      is_published = false,
      published_at,
    } = req.body;

    if (!tibetan_title || !english_title || !tibetan_description || !english_description) {
      throw new AppError('VALIDATION_ERROR', 'All title and description fields are required', 400);
    }

    // Normalize published_at DateTime
    let normalizedPublishedAt = null;
    if (is_published) {
      normalizedPublishedAt = normalizeDateTime(published_at) || new Date();
    }

    const newsItem = await newsService.create({
      tibetan_title,
      english_title,
      tibetan_description,
      english_description,
      thumbnail_url,
      is_published,
      published_at: normalizedPublishedAt,
    });

    res.status(201).json({
      id: newsItem.id,
      created_at: newsItem.created_at,
    });
  } catch (error) {
    next(error);
  }
};

const updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newsItem = await newsService.findById(id);

    if (!newsItem) {
      throw new AppError('RESOURCE_NOT_FOUND', 'News not found', 404);
    }

    const updateData = {};
    const {
      tibetan_title,
      english_title,
      tibetan_description,
      english_description,
      thumbnail_url,
      is_published,
      published_at,
    } = req.body;

    if (tibetan_title !== undefined) updateData.tibetan_title = tibetan_title;
    if (english_title !== undefined) updateData.english_title = english_title;
    if (tibetan_description !== undefined) updateData.tibetan_description = tibetan_description;
    if (english_description !== undefined) updateData.english_description = english_description;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (is_published !== undefined) {
      updateData.is_published = is_published;
      if (is_published && !newsItem.published_at) {
        updateData.published_at = normalizeDateTime(published_at) || new Date();
      }
    }
    if (published_at !== undefined) {
      // Normalize DateTime: empty strings become null, valid strings become Date objects
      updateData.published_at = normalizeDateTime(published_at);
    }

    const updated = await newsService.update(id, updateData);

    res.json({
      id: updated.id,
      updated_at: updated.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

const deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newsItem = await newsService.findById(id);

    if (!newsItem) {
      throw new AppError('RESOURCE_NOT_FOUND', 'News not found', 404);
    }

    await newsService.delete(id);

    res.json({
      message: 'News deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
};
