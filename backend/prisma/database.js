// Prisma database service layer
const { PrismaClient } = require('./generated/client');
const dotenv = require('dotenv');
dotenv.config({override: true});
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString});
const prisma = new PrismaClient({ adapter });



// Case-insensitive "contains" across several columns, for list search boxes
const searchWhere = (search, fields) => {
  const term = typeof search === 'string' ? search.trim() : '';
  if (!term) return {};
  return { OR: fields.map((field) => ({ [field]: { contains: term, mode: 'insensitive' } })) };
};

const TITLE_DESC_FIELDS = ['tibetan_title', 'english_title', 'tibetan_description', 'english_description'];

// User operations
const userService = {
  findById: async (id) => {
    return await prisma.user.findUnique({ where: { id } });
  },
  
  findByUsername: async (username) => {
    return await prisma.user.findUnique({ where: { username } });
  },
  
  findByEmail: async (email) => {
    return await prisma.user.findUnique({ where: { email } });
  },
  
  findByUsernameOrEmail: async (identifier) => {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier }
        ],
        is_active: true
      }
    });
  },
  
  findAll: async (options = {}) => {
    const { is_active, role, search, skip, take } = options;
    const where = { ...searchWhere(search, ['username', 'email']) };
    if (is_active !== undefined) {
      where.is_active = is_active;
    }
    if (role) {
      where.role = role;
    }
    return await prisma.user.findMany({ where, skip, take, orderBy: { created_at: 'desc' } });
  },

  count: async (options = {}) => {
    const { is_active, role, search } = options;
    const where = { ...searchWhere(search, ['username', 'email']) };
    if (is_active !== undefined) {
      where.is_active = is_active;
    }
    if (role) {
      where.role = role;
    }
    return await prisma.user.count({ where });
  },
  
  create: async (data) => {
    return await prisma.user.create({ data });
  },
  
  update: async (id, data) => {
    return await prisma.user.update({
      where: { id },
      data
    });
  },
  
  delete: async (id) => {
    return await prisma.user.delete({ where: { id } });
  }
};

// Catalog Category operations
const catalogCategoryService = {
  findById: async (id) => {
    return await prisma.catalogCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true
      }
    });
  },
  
  findBySlug: async (slug) => {
    return await prisma.catalogCategory.findUnique({
      where: { id_slug: slug },
      include: {
        parent: true,
        children: true
      }
    });
  },
  
  findAll: async (options = {}) => {
    const { is_active, parent_id } = options;
    const where = {};
    if (is_active !== undefined) {
      where.is_active = is_active;
    }
    if (parent_id !== undefined) {
      where.parent_id = parent_id;
    }
    return await prisma.catalogCategory.findMany({
      where,
      include: {
        parent: true,
        children: true
      },
      orderBy: { order_index: 'asc' }
    });
  },
  
  create: async (data) => {
    return await prisma.catalogCategory.create({ data });
  },
  
  update: async (id, data) => {
    return await prisma.catalogCategory.update({
      where: { id },
      data
    });
  },
  
  delete: async (id) => {
    return await prisma.catalogCategory.delete({ where: { id } });
  },
  
  hasChildren: async (id) => {
    const count = await prisma.catalogCategory.count({
      where: { parent_id: id }
    });
    return count > 0;
  }
};

// News operations
const newsService = {
  findById: async (id) => {
    return await prisma.news.findUnique({ where: { id } });
  },
  
  findAll: async (options = {}) => {
    const { is_published, search, skip, take, orderBy } = options;
    const where = { ...searchWhere(search, TITLE_DESC_FIELDS) };
    if (is_published !== undefined) {
      where.is_published = is_published;
    }
    return await prisma.news.findMany({
      where,
      skip,
      take,
      orderBy: orderBy || { created_at: 'desc' }
    });
  },
  
  count: async (options = {}) => {
    const { is_published, search } = options;
    const where = { ...searchWhere(search, TITLE_DESC_FIELDS) };
    if (is_published !== undefined) {
      where.is_published = is_published;
    }
    return await prisma.news.count({ where });
  },
  
  create: async (data) => {
    return await prisma.news.create({ data });
  },
  
  update: async (id, data) => {
    return await prisma.news.update({
      where: { id },
      data
    });
  },
  
  delete: async (id) => {
    return await prisma.news.delete({ where: { id } });
  }
};

// Timeline Period operations
const timelinePeriodService = {
  findById: async (id) => {
    return await prisma.timelinePeriod.findUnique({
      where: { id },
      include: { events: true }
    });
  },
  
  findBySlug: async (slug) => {
    return await prisma.timelinePeriod.findUnique({
      where: { id_slug: slug },
      include: { events: true }
    });
  },
  
  findAll: async () => {
    return await prisma.timelinePeriod.findMany({
      include: { events: true },
      orderBy: { start_year: 'asc' }
    });
  },
  
  create: async (data) => {
    return await prisma.timelinePeriod.create({ data });
  },
  
  update: async (id, data) => {
    return await prisma.timelinePeriod.update({
      where: { id },
      data
    });
  },
  
  delete: async (id) => {
    return await prisma.timelinePeriod.delete({ where: { id } });
  }
};

// Timeline Event operations
const timelineEventService = {
  findById: async (id) => {
    return await prisma.timelineEvent.findUnique({
      where: { id },
      include: {
        period: true,
        figures: true,
        relations: true,
        sources: true
      }
    });
  },
  
  findByPeriodId: async (periodId) => {
    return await prisma.timelineEvent.findMany({
      where: { period_id: periodId },
      orderBy: { year: 'asc' }
    });
  },
  
  findAll: async (options = {}) => {
    const { period_id, skip, take } = options;
    const where = {};
    if (period_id) {
      where.period_id = period_id;
    }
    return await prisma.timelineEvent.findMany({
      where,
      include: { period: true },
      orderBy: { year: 'asc' },
      skip,
      take
    });
  },
  
  create: async (data) => {
    return await prisma.timelineEvent.create({ data });
  },
  
  update: async (id, data) => {
    return await prisma.timelineEvent.update({
      where: { id },
      data
    });
  },
  
  delete: async (id) => {
    return await prisma.timelineEvent.delete({ where: { id } });
  }
};

// Audio Recording operations
const audioRecordingService = {
  findById: async (id) => {
    return await prisma.audioRecording.findUnique({ where: { id } });
  },
  
  findAll: async (options = {}) => {
    const { is_active, search, skip, take } = options;
    const where = { ...searchWhere(search, TITLE_DESC_FIELDS) };
    if (is_active !== undefined) {
      where.is_active = is_active;
    }
    return await prisma.audioRecording.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' }
    });
  },
  
  count: async (options = {}) => {
    const { is_active, search } = options;
    const where = { ...searchWhere(search, TITLE_DESC_FIELDS) };
    if (is_active !== undefined) {
      where.is_active = is_active;
    }
    return await prisma.audioRecording.count({ where });
  },
  
  create: async (data) => {
    return await prisma.audioRecording.create({ data });
  },
  
  update: async (id, data) => {
    return await prisma.audioRecording.update({
      where: { id },
      data
    });
  },
  
  delete: async (id) => {
    return await prisma.audioRecording.delete({ where: { id } });
  }
};

// Video operations
const videoService = {
  findById: async (id) => {
    return await prisma.video.findUnique({ where: { id } });
  },
  
  findAll: async (options = {}) => {
    const { is_active, search, skip, take } = options;
    const where = { ...searchWhere(search, TITLE_DESC_FIELDS) };
    if (is_active !== undefined) {
      where.is_active = is_active;
    }
    return await prisma.video.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' }
    });
  },
  
  count: async (options = {}) => {
    const { is_active, search } = options;
    const where = { ...searchWhere(search, TITLE_DESC_FIELDS) };
    if (is_active !== undefined) {
      where.is_active = is_active;
    }
    return await prisma.video.count({ where });
  },
  
  create: async (data) => {
    return await prisma.video.create({ data });
  },
  
  update: async (id, data) => {
    return await prisma.video.update({
      where: { id },
      data
    });
  },
  
  delete: async (id) => {
    return await prisma.video.delete({ where: { id } });
  }
};
// Karchag Main Category operations
const karchagMainCategoryService = {
  findById: async (id) => {
    return await prisma.karchagMainCategory.findUnique({
      where: { id },
      include: { sub_categories: true }
    });
  },
  
  findAll: async (options = {}) => {
    const { is_active } = options;
    const where = {};
    if (is_active !== undefined) {
      where.is_active = is_active;
    }
    return await prisma.karchagMainCategory.findMany({
      where,
      include: { sub_categories: true },
      orderBy: { order_index: 'asc' }
    });
  },
  
  create: async (data) => {
    return await prisma.karchagMainCategory.create({ data });
  },
  
  update: async (id, data) => {
    return await prisma.karchagMainCategory.update({
      where: { id },
      data
    });
  },
  
  delete: async (id) => {
    return await prisma.karchagMainCategory.delete({ where: { id } });
  }
};
// Karchag Sub Category operations
const karchagSubCategoryService = {
  findById: async (id) => {
    return await prisma.karchagSubCategory.findUnique({
      where: { id },
      include: {
        main_category: true,
        texts: true
      }
    });
  },
  
  findByMainCategoryId: async (mainCategoryId) => {
    return await prisma.karchagSubCategory.findMany({
      where: { main_category_id: mainCategoryId },
      include: { texts: true },
      orderBy: { order_index: 'asc' }
    });
  },
  
  findAll: async (options = {}) => {
    const { is_active, main_category_id, search } = options;
    const where = {};
    if (is_active !== undefined) {
      where.is_active = is_active;
    }
    if (main_category_id) {
      where.main_category_id = main_category_id;
    }
    if (search) {
      where.OR = [
        { name_english: { contains: search, mode: 'insensitive' } },
        { name_tibetan: { contains: search, mode: 'insensitive' } },
        { description_english: { contains: search, mode: 'insensitive' } },
        { description_tibetan: { contains: search, mode: 'insensitive' } }
      ];
    }
    return await prisma.karchagSubCategory.findMany({
      where,
      include: { main_category: true },
      orderBy: { order_index: 'asc' }
    });
  },
  
  create: async (data) => {
    return await prisma.karchagSubCategory.create({ data });
  },
  
  update: async (id, data) => {
    return await prisma.karchagSubCategory.update({
      where: { id },
      data
    });
  },
  
  delete: async (id) => {
    return await prisma.karchagSubCategory.delete({ where: { id } });
  }
};
// Karchag Text operations
const karchagTextService = {
  findById: async (id) => {
    return await prisma.text.findUnique({
      where: { id },
    });
  },
  
  findBySubCategoryId: async (subCategoryId) => {
    return await prisma.text.findMany({
      where: { sub_category_id: subCategoryId },
      orderBy: { order_index: 'asc' }
    });
  },
  
  findAll: async (options = {}) => {
    const { sub_category_id, is_active } = options;
    const where = {};
    if (is_active !== undefined) {
      where.is_active = is_active;
    }
    if (sub_category_id) {
      where.sub_category_id = sub_category_id;
    }
    
    return await prisma.text.findMany({
      where,
      orderBy: { created_at: 'asc' },
      include:{
        summary:{
          select:{
            summary_text_english: true,
            summary_text_tibetan: true
          }
        }
      }
    });
  },
  
  create: async (data) => {
    const text = await prisma.text.create({
      data,
      include: {
        sub_category: {
          include: { main_category: true }
        },
        summary: true
      }
    });
    
    return text;
  },
  
  update: async (id, data) => {
    const text = await prisma.text.update({
      where: { id },
      data,
      include: {
        sub_category: {
          include: { main_category: true }
        },
        summary: true
      }
    });
    
    return text;
  },
  
  delete: async (id) => {
    return await prisma.text.delete({ where: { id } });
  }
};

// Karchag Text Summary operations
const karchagTextSummaryService = {
  findByTextId: async (textId) => {
    return await prisma.karchagTextSummary.findUnique({
      where: { karchag_text_id: textId },
      include: {
        karchag_text: {
          include: {
            sub_category: {
              include: { main_category: true }
            }
          }
        }
      }
    });
  },
  
  create: async (data) => {
    return await prisma.karchagTextSummary.create({
      data,
      include: {
        karchag_text: {
          include: {
            sub_category: {
              include: { main_category: true }
            }
          }
        }
      }
    });
  },
  
  update: async (textId, data) => {
    return await prisma.karchagTextSummary.update({
      where: { karchag_text_id: textId },
      data,
      include: {
        karchag_text: {
          include: {
            sub_category: {
              include: { main_category: true }
            }
          }
        }
      }
    });
  },
  
  upsert: async (textId, data) => {
    return await prisma.karchagTextSummary.upsert({
      where: { karchag_text_id: textId },
      update: data,
      create: {
        karchag_text_id: textId,
        ...data
      },
      include: {
        karchag_text: {
          include: {
            sub_category: {
              include: { main_category: true }
            }
          }
        }
      }
    });
  },
  
  delete: async (textId) => {
    return await prisma.karchagTextSummary.delete({
      where: { karchag_text_id: textId }
    });
  }
};

// Search operations
const searchService = {
  globalSearch: async (query, options = {}) => {
    const { skip, take } = options;
    const searchTerm = query.toLowerCase();
    
    const [karchagTexts, categories, news, timelineEvents, karchagSubCategories] = await Promise.all([
      prisma.text.findMany({
        where: {
          OR: [
            { english_title: { contains: searchTerm, mode: 'insensitive' } },
            { tibetan_title: { contains: searchTerm, mode: 'insensitive' } },
            { sanskrit_title: { contains: searchTerm, mode: 'insensitive' } },
            { chinese_title: { contains: searchTerm, mode: 'insensitive' } },
            { derge_id: { contains: searchTerm, mode: 'insensitive' } },
            { yeshe_de_id: { contains: searchTerm, mode: 'insensitive' } }
          ],
          is_active: true
        },
        include: { sub_category: true },
        skip,
        take
      }),
      prisma.catalogCategory.findMany({
        where: {
          OR: [
            { id_slug: { contains: searchTerm, mode: 'insensitive' } },
            { title_english: { contains: searchTerm, mode: 'insensitive' } },
            { title_tibetan: { contains: searchTerm, mode: 'insensitive' } }
          ],
          is_active: true
        },
        skip,
        take
      }),
      prisma.news.findMany({
        where: {
          OR: [
            { english_title: { contains: searchTerm, mode: 'insensitive' } },
            { tibetan_title: { contains: searchTerm, mode: 'insensitive' } }
          ],
          is_published: true
        },
        skip,
        take
      }),
      prisma.timelineEvent.findMany({
        where: {
          OR: [
            { title_english: { contains: searchTerm, mode: 'insensitive' } },
            { title_tibetan: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: { period: true },
        skip,
        take
      }),
      prisma.karchagSubCategory.findMany({
        where: {
          OR: [
            { name_english: { contains: searchTerm, mode: 'insensitive' } },
            { name_tibetan: { contains: searchTerm, mode: 'insensitive' } },
            { description_english: { contains: searchTerm, mode: 'insensitive' } },
            { description_tibetan: { contains: searchTerm, mode: 'insensitive' } }
          ],
          is_active: true
        },
        include: { main_category: true },
        skip,
        take
      })
    ]);
    
    return {
      texts: karchagTexts,
      categories,
      news,
      timelineEvents,
      subCategories: karchagSubCategories
    };
  }
};

module.exports = {
  prisma,
  userService,
  catalogCategoryService,
  newsService,
  timelinePeriodService,
  timelineEventService,
  audioRecordingService,
  videoService,
  karchagMainCategoryService,
  karchagSubCategoryService,
  karchagTextService,
  karchagTextSummaryService,
  searchService
};
