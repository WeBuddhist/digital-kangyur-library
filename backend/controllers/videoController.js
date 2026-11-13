const { videoService } = require('../prisma/database');
const { AppError } = require('../utils/errors');
const { paginate, parsePaginationParams } = require('../utils/pagination');

const getVideos = async (req, res, next) => {
  try {
    const { page, limit } = parsePaginationParams(req);
    const {
      search,
      lang = 'en',
      is_active = 'true',
    } = req.query;

    const skip = (page - 1) * limit;
    const take = limit;
    // 'all' lists active and inactive (admin)
    const isActiveFilter = is_active === 'all' ? undefined : is_active === 'true';

    const videos = await videoService.findAll({
      is_active: isActiveFilter,
      search,
      skip,
      take
    });

    const total = await videoService.count({ is_active: isActiveFilter, search });
    const pagination = {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
      has_next: page * limit < total,
      has_prev: page > 1
    };


    const formattedVideos = videos.map(video => ({
      id: video.id,
      title: {
        tibetan: video.tibetan_title,
        english: video.english_title,
      },
      description: {
        tibetan: video.tibetan_description,
        english: video.english_description,
      },
      video_link: video.video_link,
      thumbnail_url: video.thumbnail_url,
      is_active: video.is_active,
      created_at: video.created_at,
    }));

    res.json({
      videos: formattedVideos,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getVideoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const video = await videoService.findById(id);
    if (!video) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Video not found', 404);
    }

    res.json({
      id: video.id,
      title: {
        tibetan: video.tibetan_title,
        english: video.english_title,
      },
      description: {
        tibetan: video.tibetan_description,
        english: video.english_description,
      },
      video_link: video.video_link,
      thumbnail_url: video.thumbnail_url,
      is_active: video.is_active,
      created_at: video.created_at,
      updated_at: video.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

const createVideo = async (req, res, next) => {
  try {
    const {
      tibetan_title,
      english_title,
      tibetan_description,
      english_description,
      video_link,
      thumbnail_url,
      is_active = true,
    } = req.body;

    if (!tibetan_title || !english_title || !video_link) {
      throw new AppError('VALIDATION_ERROR', 'tibetan_title, english_title, and video_link are required', 400);
    }

    const video = await videoService.create({
      tibetan_title,
      english_title,
      tibetan_description: tibetan_description || '',
      english_description: english_description || '',
      video_link,
      thumbnail_url: thumbnail_url || null,
      is_active,
    });

    res.status(201).json({
      id: video.id,
      created_at: video.created_at,
    });
  } catch (error) {
    next(error);
  }
};

const updateVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await videoService.findById(id);

    if (!video) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Video not found', 404);
    }

    const updateData = {};
    const fields = [
      'tibetan_title', 'english_title', 'tibetan_description', 'english_description',
      'video_link', 'thumbnail_url', 'is_active',
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updated = await videoService.update(id, updateData);

    res.json({
      id: updated.id,
      updated_at: updated.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await videoService.findById(id);

    if (!video) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Video not found', 404);
    }

    await videoService.delete(id);

    res.json({
      message: 'Video deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
};
