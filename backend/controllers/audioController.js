const { audioRecordingService } = require('../prisma/database');
const { AppError } = require('../utils/errors');
const { paginate, parsePaginationParams } = require('../utils/pagination');

const getAudio = async (req, res, next) => {
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

    const recordings = await audioRecordingService.findAll({
      is_active: isActiveFilter,
      search,
      skip,
      take
    });

    const total = await audioRecordingService.count({ is_active: isActiveFilter, search });
    const pagination = {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
      has_next: page * limit < total,
      has_prev: page > 1
    };


    const formattedRecordings = recordings.map(recording => ({
      id: recording.id,
      title: {
        tibetan: recording.tibetan_title,
        english: recording.english_title,
      },
      description: {
        tibetan: recording.tibetan_description,
        english: recording.english_description,
      },
      audio_url: recording.audio_url,
      thumbnail_url: recording.thumbnail_url,
      duration: recording.duration,
      is_active: recording.is_active,
      created_at: recording.created_at,
    }));

    res.json({
      recordings: formattedRecordings,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getAudioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const recording = await audioRecordingService.findById(id);
    if (!recording) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Audio recording not found', 404);
    }

    res.json({
      id: recording.id,
      title: {
        tibetan: recording.tibetan_title,
        english: recording.english_title,
      },
      description: {
        tibetan: recording.tibetan_description,
        english: recording.english_description,
      },
      audio_url: recording.audio_url,
      thumbnail_url: recording.thumbnail_url,
      duration: recording.duration,
      is_active: recording.is_active,
      created_at: recording.created_at,
      updated_at: recording.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

const createAudio = async (req, res, next) => {
  try {
    const {
      tibetan_title,
      english_title,
      tibetan_description,
      english_description,
      audio_url,
      thumbnail_url,
      duration,
      is_active = true,
    } = req.body;

    if (!tibetan_title || !english_title || !audio_url) {
      throw new AppError('VALIDATION_ERROR', 'tibetan_title, english_title, and audio_url are required', 400);
    }

    const recording = await audioRecordingService.create({
      tibetan_title,
      english_title,
      tibetan_description: tibetan_description || null,
      english_description: english_description || null,
      audio_url,
      thumbnail_url: thumbnail_url || null,
      duration: duration || null,
      is_active,
    });

    res.status(201).json({
      id: recording.id,
      created_at: recording.created_at,
    });
  } catch (error) {
    next(error);
  }
};

const updateAudio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recording = await audioRecordingService.findById(id);

    if (!recording) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Audio recording not found', 404);
    }

    const updateData = {};
    const fields = [
      'tibetan_title', 'english_title', 'tibetan_description', 'english_description',
      'audio_url', 'thumbnail_url', 'duration', 'is_active',
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updated = await audioRecordingService.update(id, updateData);

    res.json({
      id: updated.id,
      updated_at: updated.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAudio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recording = await audioRecordingService.findById(id);

    if (!recording) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Audio recording not found', 404);
    }

    await audioRecordingService.delete(id);

    res.json({
      message: 'Audio recording deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAudio,
  getAudioById,
  createAudio,
  updateAudio,
  deleteAudio,
};
