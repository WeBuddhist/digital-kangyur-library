const bcrypt = require('bcryptjs');
const { 
  userService, 
  catalogCategoryService, 
  newsService, 
  timelineEventService, 
  audioRecordingService, 
  karchagTextService,
  prisma
} = require('../prisma/database');
const { AppError } = require('../utils/errors');
const { paginate, parsePaginationParams } = require('../utils/pagination');

const getDashboard = async (req, res, next) => {
  try {
    const [totalKarchagTexts, totalCategories, totalNews, totalTimelineEvents, totalAudioRecordings, totalVideos] = await Promise.all([
      prisma.karchagText.count(),
      prisma.catalogCategory.count(),
      prisma.news.count(),
      prisma.timelineEvent.count(),
      prisma.audioRecording.count(),
      prisma.video.count()
    ]);

    const statistics = {
      total_karchag_texts: totalKarchagTexts,
      total_categories: totalCategories,
      total_news: totalNews,
      total_timeline_events: totalTimelineEvents,
      total_audio_recordings: totalAudioRecordings,
      total_videos: totalVideos,
      recent_activity: [],
    };

    // Get recent activity (last 10 items)
    const activities = [];
    
    // Recent karchag texts
    const recentTexts = await prisma.karchagText.findMany({
      take: 5,
      orderBy: { created_at: 'desc' }
    });
    recentTexts.forEach(text => {
      activities.push({
        type: 'karchag_text_created',
        id: text.id,
        title: text.english_title || text.tibetan_title || 'Untitled',
        created_at: text.created_at,
      });
    });

    // Recent news
    const recentNews = await prisma.news.findMany({
      take: 3,
      orderBy: { created_at: 'desc' }
    });
    recentNews.forEach(news => {
      activities.push({
        type: 'news_created',
        id: news.id,
        title: news.english_title,
        created_at: news.created_at,
      });
    });

    // Sort by created_at descending
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    statistics.recent_activity = activities.slice(0, 10);

    res.json({
      statistics,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page, limit } = parsePaginationParams(req);
    const { role, is_active, search } = req.query;

    const options = { search };
    if (role) {
      options.role = role;
    }
    if (is_active !== undefined) {
      options.is_active = is_active === 'true';
    }

    const [items, total] = await Promise.all([
      userService.findAll({ ...options, skip: (page - 1) * limit, take: limit }),
      userService.count(options),
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
    };

    const formattedUsers = items.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
    }));

    res.json({
      users: formattedUsers,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { username, email, password, role = 'viewer' } = req.body;

    if (!username || !email || !password) {
      throw new AppError('VALIDATION_ERROR', 'username, email, and password are required', 400);
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      throw new AppError('VALIDATION_ERROR', 'Invalid role', 400);
    }

    // Check if username or email already exists
    const existingUser = await userService.findByUsernameOrEmail(username);
    if (existingUser) {
      throw new AppError('DUPLICATE_RESOURCE', 'Username already exists', 409);
    }

    const existingEmail = await userService.findByEmail(email);
    if (existingEmail) {
      throw new AppError('DUPLICATE_RESOURCE', 'Email already exists', 409);
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await userService.create({
      username,
      email,
      password_hash,
      role,
      is_active: true,
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.findById(id);

    if (!user) {
      throw new AppError('RESOURCE_NOT_FOUND', 'User not found', 404);
    }

    const updateData = {};
    const { email, role, is_active } = req.body;

    if (email !== undefined) {
      // Check if email already exists for another user
      const existingEmail = await userService.findByEmail(email);
      if (existingEmail && existingEmail.id !== id) {
        throw new AppError('DUPLICATE_RESOURCE', 'Email already exists', 409);
      }
      updateData.email = email;
    }

    if (role !== undefined) {
      if (!['admin', 'editor', 'viewer'].includes(role)) {
        throw new AppError('VALIDATION_ERROR', 'Invalid role', 400);
      }
      updateData.role = role;
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    const updated = await userService.update(id, updateData);

    res.json({
      id: updated.id,
      updated_at: updated.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.findById(id);

    if (!user) {
      throw new AppError('RESOURCE_NOT_FOUND', 'User not found', 404);
    }

    // Prevent deleting yourself
    if (user.id === req.user.sub) {
      throw new AppError('VALIDATION_ERROR', 'Cannot delete your own account', 400);
    }

    await userService.delete(id);

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
